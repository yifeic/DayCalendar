'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
} = React;

class EventBox extends React.Component {
  render() {
    return (
      <View style={[this.props.style, styles.eventBox]}>
        <Text>{this.props.title}</Text>
        
      </View>
    );
  }
}

EventBox.propTypes = { title: React.PropTypes.string };

var styles = StyleSheet.create({
  eventBox: {
    flex: 1,
    backgroundColor: 'rgba(234, 245, 252, 0.8)',
    borderColor: 'rgba(195, 226, 242, 1.0)', 
    borderWidth: 1.0,
    borderRadius: 3,
  }
});

module.exports = EventBox;
