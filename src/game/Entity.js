// @flow

import typeof Noun from './Noun'
import Adjective from "./Adjective";

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

    is(adjective: Adjective | string) {
        return this.noun.adjectives.has(adjective) || Array.from(this.noun.adjectives).some(a => a.id === adjective)
    }

}