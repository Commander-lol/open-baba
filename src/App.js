import React, {Component} from 'react'
import './App.css';
import Level from './render/Level'
import LevelData from './game/Level'
import testLevel from './data/testlevel2'

import Editor from './editor/Editor'

class App extends Component<{}> {
    state = {
        margin: 0,
        scale: 1.5,
        showOptions: false,
        rawLevelData: null,
        levelData: null,
        screen: 'game',
        isWin: false,
    }

    componentDidMount() {
        this.loadLevelData(testLevel)
    }

    async loadLevelData(data = this.state.rawLevelData) {
        const levelData = await LevelData.from(data)
        await levelData.tick()
        this.setState({ isWin: false, levelData, rawLevelData: data })
    }

    render() {
        const { margin, scale, showOptions, levelData } = this.state
        const opts = {margin, scale}

        return (
            <React.Fragment>
                <div className="render-controls" style={showOptions && {marginLeft: 0} || {}}>
                    <div className="render-controls-row">
                        <label>Margin: </label>
                        <input type="number" value={margin} onChange={this.set('margin')}/>
                    </div>
                    <div className="render-controls-row">
                        <label>Scale: </label>
                        <input type="number" value={scale} onChange={this.set('scale')} step={0.25}/>
                    </div>
                </div>
                <div className="root-container" style={showOptions && {marginLeft: 420} || {}}>
                    <button onClick={this.set('showOptions', s => !s.showOptions)}>{ showOptions ? 'Hide' : 'Show' } Options</button>
                    <button onClick={this.set('screen', s => s.screen === 'editor' ? 'game' : 'editor')}>Toggle Editor</button>
                    <button onClick={() => this.loadLevelData()}>Reset Level</button>
                    <br/>
                    {
                        (() => {
                            switch (this.state.screen) {
                                case 'game':
                                    if (this.state.isWin) {
                                        return <h2>A winner is you</h2>
                                    } else if (levelData == null) {
                                        return <span>LOADING</span>
                                    } else {
                                        return <Level level={levelData} {...opts} onWin={this._win}/>
                                    }
                                case 'editor': {
                                    return this.state.rawLevelData && (
                                        <Editor
                                            data={this.state.rawLevelData}
                                            onChange={data => {
                                                this.loadLevelData(data)
                                            }}
                                        />
                                    )
                                }
                                default:
                                    return null
                            }
                        })()
                    }
                </div>
            </React.Fragment>
        );
    }

    _win = () => {
        this.setState({ isWin: true })
    }

    set = (name, value = null) => e => {
        const targetValue = e.currentTarget.value
        this.setState(s => ({ [name]: value && value.call ? value(s) : value || targetValue }))
    }
}

export default App;
