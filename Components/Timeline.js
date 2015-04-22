'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
  PixelRatio,
} = React;

class Timeline extends React.Component {
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <Text style={styles.time}>{this.props.time}</Text>
        <View style={styles.line}></View>
      </View>
    );
  }
}

Timeline.propTypes = { time: React.PropTypes.string };

var styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    // fontSize: 20,
    textAlign: 'right',
    width: 60,
    backgroundColor: 'white',
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: '#bbbbbb',
    marginLeft: 10,
  },
});

module.exports = Timeline;
