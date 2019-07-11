

export default class Adjective {
    id: string
    interactions: { [id: string]: string }

    meta = {}

    static async resolveInteractionSource(source) {
        switch (source.type) {
            case "inline": return source.data.interactions
            case "internal": {
                const data = await import(`../data/${ source.data }`)
                if (data.default) {
                    return data.default.interactions
                }
                return data.interactions
            }
            default:
                throw TypeError(`Invalid interactions source for ${ JSON.stringify(source) }`)
        }
    }

    constructor(id, interactions) {
        this.id = id
        this.interactions = interactions
    }

    interact(other) {
        console.log(this.id, this.interactions)
        console.log(other.id, other.interactions)
        return this.interactions[other.id]
    }
}