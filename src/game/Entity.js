// @flow

import typeof Noun from './Noun'

export default class Entity {
    x: number
    y: number
    noun: Noun

    fallbackImage: ?string = null

    meta = {}

    constructor([x, y], noun) {
        this.x = x
        this.y = y
        this.noun = noun
    }

    get position(): [number, number] {
        return [this.x, this.y]
    }

    get renderProps() {
        return {
            x: this.x,
            y: this.y,
            image: this.noun.entityImage || this.fallbackImage,
        }
    }

    onCollide(other: Entity) {
        return this.noun.interact(other.noun, this.position, other.position)
    }

}