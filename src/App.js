import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Level from './render/Level'
import LevelData from './game/Level'
import testLevel from './data/testlevel1'

class App extends Component<{}> {
    state = {
        margin: 1,
        scale: 1,
        showOptions: false,
        levelData: null
    }

    async componentDidMount() {
        const levelData = await LevelData.from(testLevel)
        levelData.tick()
        this.setState({ levelData })
    }

    render() {
        const { margin, scale, showOptions, levelData } = this.state

        const opts = {margin, scale}
        return (
            <React.Fragment>
                <div className="render-controls" style={showOptions && {marginLeft: 0} || {}}>
                    <div className="render-controls-row"><label>Margin: </label><input type="number" value={margin}
                                                                                       onChange={this.set('margin')}/>
                    </div>
                    <div className="render-controls-row"><label>Scale: </label><input type="number" value={scale}
                                                                                      onChange={this.set('scale')}
                                                                                      step={0.25}/></div>
                </div>
                <div className="root-container" style={showOptions && {marginLeft: 420} || {}}>
                    <button onClick={this.set('showOptions', s => !s.showOptions)}>Show Options</button>
                    <br/>
                    { levelData == null ? <span>LOADING</span> : <Level level={levelData} {...opts} /> }
                </div>
            </React.Fragment>
        );
    }

    set = (name, value = null) => e => {
        const targetValue = e.currentTarget.value
        this.setState(s => ({ [name]: value && value.call ? value(s) : value || targetValue }))
    }
}

export default App;
