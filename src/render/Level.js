import React from 'react'
import LevelData, { Inputs } from '../game/Level'

function* __rangeInner(start, end, step) {
    let c = start
    while (c < end) {
        yield c
        c += step
    }
}

function range(...args) {
    if (args.length === 1) {
        const [end] = args
        return __rangeInner(0, end, 1)
    }
    if (args.length === 2) {
        const [start, end] = args
        return __rangeInner(start, end, 1)
    }
    if (args.length === 3) {
        const [start, end, step] = args
        return __rangeInner(start, end, step)
    }
    throw new TypeError('Invalid number of arguments')
}

type Props = {
    scale?: number,
    size?: number,
    margin?: number,
    level: LevelData,
}

export default class Level extends React.Component<Props> {
    static defaultProps = {
        scale: 1,
        size: 32,
        margin: 1,
        active: false,
    }


    state = {
        nonce: Math.random(),
    }


    componentDidMount(): void {
        window.addEventListener('keyup', this.handleKeyPress)
    }

    handleKeyPress = async e => {
        e.preventDefault()
        if (this.state.active > 0) {
            return
        }
        const { key } = e
        let input = null
        switch (key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
                input = Inputs.Controls.Left
                break
            case 'arrowright':
            case 'd':
                input = Inputs.Controls.Right
                break
            case 'arrowdown':
            case 's':
                input = Inputs.Controls.Down
                break
            case 'arrowup':
            case 'w':
                input = Inputs.Controls.Up
                break
            case ' ':
                input = Inputs.Actions.Wait
                break
        }

        if (input) {
            this.setState(s => ({ active: s.active + 1 }))
            await this.props.level.processInput(input)
            this.setState(s => ({ nonce: Math.random(), active: s.active - 1 }))
        }
    }

    render() {
        const {scale, size, margin, level} = this.props
        const {width, height} = level
        return (
            <div className="level-container">
                {[...range(width)].map(x =>
                    [...range(height)].map(y => (
                        <div className="level-tile" style={{
                            left: (margin * x) + (x * 32 * scale),
                            top: (margin * y) + (y * 32 * scale),
                            width: size * scale,
                            height: size * scale
                        }}/>
                    ))
                ).reduce((a, c) => (a || []).concat(c))}
                {level.entities.map(entity => {
                    const {x, y, image} = entity.renderProps
                    const left = (margin * x) + (x * 32 * scale)
                    const top = (margin * y) + (y * 32 * scale)

                    return (
                        <img className="level-entity" src={image} style={{
                            left,
                            top,
                            width: size * scale,
                            height: size * scale
                        }}/>
                    )
                })}
                {level.connectors.map(connector => {
                    const {x, y, type: cType} = connector
                    const left = (margin * x) + (x * 32 * scale)
                    const top = (margin * y) + (y * 32 * scale)

                    return (
                        <img className="level-entity" src={`/${ cType }-text.png`} style={{
                            left,
                            top,
                            width: size * scale,
                            height: size * scale
                        }}/>
                    )
                })}
            </div>
        )
    }

}