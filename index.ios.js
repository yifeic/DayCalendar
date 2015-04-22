/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var DayCalendar = require('./Components/DayCalendar');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var DayCalendarDemo = React.createClass({
  render: function() {
    
    return (
      <View style={styles.container}>
      <DayCalendar style={styles.dayCalendar} />
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 75,
  },


});

AppRegistry.registerComponent('DayCalendarDemo', () => DayCalendarDemo);
