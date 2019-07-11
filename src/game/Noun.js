// @flow

import Adjective from './Adjective'

export type ImageOptions = {
    text: string,
    entity?: string,
}

export default class Noun {
    adjectives: Set<Adjective>

    textImage: string
    entityImage: string

    meta = {}

    static async createDefaultTextNoun() {
        const text = new Noun({ text: '/text-text.png' })
        const pushData = await Adjective.resolveInteractionSource({ type: 'internal', data: 'adjectives/push' })
        const push = new Adjective('push', pushData)
        text.adjectives.add(push)
        text.meta.defaultTextNoun = true
        return text
    }

    constructor(images: ImageOptions) {
        this.textImage = images.text
        this.entityImage = images.entity
        this.adjectives = new Set()
    }

    async interact(otherNoun: Noun, ownLocation: [number, number], previousLocation: [number, number]) {
        const otherAdjectives = otherNoun.adjectives
        console.log(this.adjectives)
        outer: for (const adjective of this.adjectives) {
            for (const other of otherAdjectives) {
                console.log(adjective)
                const outcome = await adjective.interact(other, ownLocation, previousLocation)
                return outcome
                //
                // console.log(adjective.id, other.id, outcome)
                // switch (outcome) {
                //     case "stop":
                //         break outer
                //     case "destroy-self":
                //         console.log("DESTROY_SELF")
                //         break outer
                //     case "destroy-other":
                //         console.log("DESTORY_OTHER")
                //         break outer
                //     case "destroy-both":
                //         console.log("DESTROY_BOTH")
                //         break outer
                //     case "is-moved":
                //         console.log("MOVE_BOTH")
                //         break outer
                // }
            }
        }
    }

    clear() {
        this.set([])
    }

    set(adjectives) {
        this.adjectives = new Set(adjectives)
    }

    add(adjective) {
        this.adjectives.add(adjective)
    }
}