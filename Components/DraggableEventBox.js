'use strict';

var React = require('react-native');
var EventBox = require('./EventBox');
var {
  StyleSheet,
  PanResponder,
} = React;

class DraggableEventBox extends React.Component {

  constructor(props) {
    super(props);
    this.panResponder = {};
    this.previousLeft = props.style.left;
    this.previousTop = props.style.top;
  }

  componentWillMount() {
      this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
  }

  render() {
    return (
      <EventBox title={this.props.title}/>
    );
  }

  _updatePosition() {
    this.circle && this.circle.setNativeProps(this._circleStyles);
  }
}

DraggableEventBox.propTypes = { title: React.PropTypes.string };

module.exports = DraggableEventBox;
