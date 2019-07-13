import Adjective from './Adjective'
import Noun from './Noun'
import Entity from './Entity'

type MapOf<Type> = { [id: string]: Type }

type ConstructorParams = { adjectives: MapOf<Adjective>, nouns: MapOf<Noun>, entities: Entity[], width: number, height: number, name: string, connectors: Object[] }

export const Inputs = {
    Controls: {
        Up: 'controls_up',
        Left: 'controls_left',
        Right: 'controls_right',
        Down: 'controls_down',
    },
    Actions: {
        Wait: 'action_wait',
    },
}

export default class Level {
    adjectives: MapOf<Adjective>
    nouns: MapOf<Noun>
    entities: Entity[]
    width: number
    height: number
    name: string
    connectors: Object[]

    static async from(source) {
        const width = source.width
        const height = source.height
        const name = source.name || 'A Level'

        const entities = []
        const nouns = {}
        const adjectives = {}

        const textNoun = await Noun.createDefaultTextNoun()

        const rawNouns = source.nouns || []
        for (const src of rawNouns) {
            const noun = new Noun(src.images)
            nouns[src.name] = noun
            if (src.hasOwnProperty('text_start_locations')) {
                for (const {x, y} of src.text_start_locations) {
                    const entity = new Entity([x, y], textNoun)
                    entity.fallbackImage = noun.textImage
                    entity.meta = {
                        type: 'noun',
                        name: src.name,
                    }
                    entities.push(entity)
                }
            }
            if (src.hasOwnProperty('entity_start_locations')) {
                for (const {x, y} of src.entity_start_locations) {
                    const entity = new Entity([x, y], noun)
                    entities.push(entity)
                }
            }
        }

        const rawAdjectives = source.adjectives || []
        for (const src of rawAdjectives) {
            const interactions = await Adjective.resolveInteractionSource(src.source)
            const adjective = new Adjective(src.name, interactions)
            adjectives[src.name] = adjective
            if (src.hasOwnProperty('text_start_locations')) {
                for (const {x, y} of src.text_start_locations) {
                    const entity = new Entity([x, y], textNoun)
                    entity.fallbackImage = src.images.text
                    entity.meta = {
                        type: 'adjective',
                        name: src.name,
                    }
                    entities.push(entity)
                }
            }
        }

        if (source.hasOwnProperty('connectors')) {
            for (const { x, y, type: cType } of source.connectors) {
                const entity = new Entity([x, y], textNoun)
                entity.fallbackImage = `/${ cType }-text.png`
                entity.meta = {
                    type: 'connector',
                    name: cType,
                }
                entities.push(entity)
            }
        }

        return new Level({
            width,
            height,
            name,
            entities,
            nouns,
            adjectives,
        })
    }


    constructor(opts: ConstructorParams) {
        this.adjectives = opts.adjectives;
        this.nouns = opts.nouns;
        this.entities = opts.entities;
        this.width = opts.width;
        this.height = opts.height;
        this.name = opts.name;
    }

    get connectors() {
        const connectors = this.findEntities(e => e.meta.type === 'connector')
        return connectors.map(c => ({ x: c.x, y: c.y, type: c.meta.name }))
    }

    findEntities(p) {
        return this.entities.filter(p)
    }

    findEntitiesAt(x, y, p = () => true) {
        return this.entities.filter(e => e.x === x && e.y === y && p(e))
    }

    findEntitiesFor(noun) {
        return this.entities.filter(e => e.noun === noun || e.noun.meta.name === noun)
    }

    findEntitiesThat(adjective) {
        if (typeof adjective === 'string') {
            return this.entities.filter(e => {
                return Array.from(e.noun.adjectives).some(a => a.id === adjective)
            })
        } else {
            return this.entities.filter(e => e.noun.adjectives.has(adjective))
        }
    }

    swapNouns(oldNoun, newNoun) {
        this.entities.forEach(entity => {
            if (entity.noun === oldNoun) {
                entity.noun = newNoun
            }
        })
    }

    moveYou({ x = 0, y = 0 } = {}) {
        const you = this.adjectives.you
        if (you) {
            console.log(you)
            this.findEntitiesThat(you).forEach(entity => {
                entity.x += x
                entity.y += y
            })
        }
    }

    async processInput(input = Inputs.Actions.Wait) {
        switch(input) {
            case Inputs.Controls.Up: {
                const md = { x: 0, y: -1 }
                this.moveYou(md)
                return this.tick(md)
            }
            case Inputs.Controls.Left: {
                const md = { x: -1, y: 0 }
                this.moveYou(md)
                return this.tick(md)
            }
            case Inputs.Controls.Right: {
                const md = { x: 1, y: 0 }
                this.moveYou(md)
                return this.tick(md)
            }
            case Inputs.Controls.Down: {
                const md = { x: 0, y: 1 }
                this.moveYou(md)
                return this.tick(md)
            }
            case Inputs.Actions.Wait: {
                return this.tick()
            }
        }
    }

    async resolveEntityInteractions(entity, delta) {
        const others = this.findEntitiesAt(entity.x, entity.y, e => e !== entity)
        if (others.length > 0) {
            for (const other of others) {
                const result = await entity.onCollide(other)

                if (result === 'is-moved' && delta) {
                    other.x += delta.x
                    other.y += delta.y
                    await this.resolveEntityInteractions(other, delta)
                } else if (result === 'stop' && delta) {
                    entity.x -= delta.x
                    entity.y -= delta.y
                    await this.resolveEntityInteractions(entity, delta)
                }
            }
        }
    }

    async tick(delta= null) {
        for (const entity of this.entities) {
            await this.resolveEntityInteractions(entity, delta)
        }

        const newDelta = this.connectors.map(connector => {
            let leftright = null
            const [left] = this.findEntitiesAt(connector.x - 1, connector.y, e => e.meta && e.meta.type)
            const [right] = this.findEntitiesAt(connector.x + 1, connector.y, e => e.meta && e.meta.type)

            if (left && right) {
                leftright = { from: left, to: right }
            }

            let updown = null
            const [up] = this.findEntitiesAt(connector.x, connector.y - 1, e => e.meta && e.meta.type)
            const [down] = this.findEntitiesAt(connector.x, connector.y + 1, e => e.meta && e.meta.type)

            if (up && down) {
                updown = { from: up, to: down }
            }

            return [leftright, updown].filter(Boolean)
        }).reduce((acc, c) => (acc || []).concat(c)).reduce((acc, connection) => {
            if (connection.from.meta.type === 'noun') {
                const { from, to } = connection
                const fromName = from.meta.name
                acc[fromName] = acc[fromName] || []
                acc[fromName].push(to)
            }

            return acc
        }, {})

        Object.values(this.nouns).forEach(noun => noun.clear())

        outer: for (const [name, newSet] of Object.entries(newDelta)) {
            const noun = this.nouns[name]
            if (noun) {
                const adjectives = []
                for (const updated of newSet) {
                    if (updated.meta.type === 'noun') {
                        this.swapNouns(noun, this.nouns[updated.meta.name])
                        continue outer
                    } else if (updated.meta.type === 'adjective') {
                        adjectives.push(this.adjectives[updated.meta.name])
                    }
                }

                noun.set(adjectives.filter(Boolean))
            }
        }

        return this.findEntitiesThat('win').some(target => {
            return this.findEntitiesAt(target.x, target.y, e => e !== target).some(other => other.is('you'))
        })
    }
}