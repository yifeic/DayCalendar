var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
} = React;

class Event extends React.Component {
  render() {
    return (
      <View style={styles.event}>
        <Text>{this.props.title}</Text>
        
      </View>
    );
  }
}

Event.propTypes = { title: React.PropTypes.string };

var styles = StyleSheet.create({
  event: {
    backgroundColor: rgba(234, 245, 252, 0.8),
  }
});

module.exports = Event;
