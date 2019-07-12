// @flow

import React from 'react'

import { range } from '../render/Level'

type Props = {
	data: Object,
	onChange: Function,
}

class Point extends React.PureComponent {
	render() {
		const { point: { x, y }, onChange } = this.props
		return (
			<div>
				<label>X:</label><input type="number" value={x} onChange={e => onChange({ x: e.currentTarget.value, y })} />
				<label>Y:</label><input type="number" value={y} onChange={e => onChange({ y: e.currentTarget.value, x })} />
			</div>
		)
	}
}

class Section extends React.Component {
	render() {
		const { children, entries, onNew } = this.props
		return entries.map(children)
	}
}

class PointGrid extends React.PureComponent {
	render() {
		const { width, height, points, pointWidth = 10, pointHeight = 10, margin = 1, onChange } = this.props
		const index = new Set()
		const createKey = (x, y) => `${ x }|${ y }`


		points.forEach(point => index.add(createKey(point.x, point.y)))

		return (
			<div style={{ width: width * pointWidth * margin, height: height * pointHeight * margin, position: 'relative' }}>
				{ [...range(width)].map(x => (
					[...range(height)].map(y => (
						<div
							style={{
								position: 'absolute',
								left: (x * pointWidth) + (margin * pointWidth),
								top: (y * pointHeight) + (margin * pointHeight),
								width: pointWidth,
								height: pointHeight,
								backgroundColor: index.has(createKey(x, y)) ? 'red' : 'grey'
							}}
							onClick={() => {
								const alreadyActive = index.has(createKey(x, y))
								if (alreadyActive) {
									const index = points.findIndex(item => item.x === x && item.y === y)
									const newPoints = [...points.slice(0, index), ...points.slice(index + 1)]
									onChange(newPoints)
								} else {
									onChange(Array.from(points).concat([{ x, y }]))
								}
							}}
						/>
					))
				))}
			</div>
		)
	}
}

export default class Editor extends React.Component<Props> {

	bindMerge = (mergefn) => {
		return e => {
			const value = e.currentTarget.value
			const newData = { ...this.props.data }
			mergefn(newData, value)
			this.props.onChange(newData)
		}
	}



	render() {
		const { width, height, name, connectors, nouns, adjectives } = this.props.data
		return (
			<div>
				<div>
					Name: <input value={name} onChange={this.bindMerge((d, n) => d.name = n)} />
					Width: <input value={width} onChange={this.bindMerge((d, n) => d.width = n)} type="number" />
					Height: <input value={height} onChange={this.bindMerge((d, n) => d.height = n)} type="number" />
				</div>

				<h3>Connectors</h3>
				<Section entries={connectors}>
					{ (data, i) => (
						<div key={i}>
							<span>Type:</span><code>is</code>
							<Point point={data} onChange={point => {
								const data = { ...this.props.data }
								data.connectors[i] = { ...point, type: 'is' }
								this.props.onChange(data)
							}} />
						</div>
					)}
				</Section>

				<h3>Nouns</h3>
				<Section entries={nouns}>
					{ (data, i) => (
						<div key={i} style={{ border: '1px solid black', padding: '15px'}}>
							<label>Name: </label><input value={data.name} />
							<div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '20px' }}>
								<div style={{ display: 'inline-block' }}>
									<h4>Text</h4>
									{ data.text_start_locations && <PointGrid width={width} height={height} points={data.text_start_locations} onChange={newList => {
										const newData = {...this.props.data}
										newData.nouns[i].text_start_locations = newList
										this.props.onChange(newData)
									}}/> }
								</div>
								<div style={{ display: 'inline-block' }}>
									<h4>Entities</h4>
									{ data.entity_start_locations && <PointGrid width={width} height={height} points={data.entity_start_locations} onChange={newList => {
										const newData = {...this.props.data}
										newData.nouns[i].entity_start_locations = newList
										this.props.onChange(newData)
									}}/> }
								</div>
							</div>
						</div>
					)}
				</Section>

				<h3>Adjectives</h3>
				<Section entries={adjectives}>
					{ (data, i) => (
						<div key={i} style={{ border: '1px solid black', padding: '15px'}}>
							<label>Name: </label><input value={data.name} />
							<div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '20px' }}>
								<div style={{ display: 'inline-block' }}>
									<h4>Text</h4>
									{ data.text_start_locations && <PointGrid width={width} height={height} points={data.text_start_locations} onChange={newList => {
										const newData = {...this.props.data}
										newData.adjectives[i].text_start_locations = newList
										this.props.onChange(newData)
									}}/> }
								</div>
								{/*<div style={{ display: 'inline-block' }}>*/}
								{/*	<h4>Entities</h4>*/}
								{/*	{ data.entity_start_locations && <PointGrid width={width} height={height} points={data.entity_start_locations} /> }*/}
								{/*</div>*/}
							</div>
						</div>
					)}
				</Section>

				<pre><code>{ JSON.stringify(this.props.data, null, 2) }</code></pre>
			</div>
		)
	}
}