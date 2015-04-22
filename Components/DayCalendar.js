'use strict';

var React = require('react-native');
var Timeline = require('./Timeline');
var EventBox = require('./EventBox');
var DraggableEventBox = require('./DraggableEventBox');
var moment = require('moment');

var {
  StyleSheet,
  ScrollView,
  View,
  Text,
  PanResponder,
} = React;

var HOURS_COUNT = 25;
var HOURS = [];
for (var i = 0; i < HOURS_COUNT; i++) {
    var hour = moment().hour(i).minute(0).second(0).format('h:mma');
    HOURS.push(hour);
}
var MINUTES_INA_DAY = 60*24;

var DayCalendar = React.createClass({

  panResponder: {},
  draggableEventBoxPreviousTop: 100,
  draggableEventBox: null,
  draggableEventBoxStyle: {position: 'absolute', left: 80, right: 20, top: this.draggableEventBoxPreviousTop, height: 100, borderRadius: 3},

  propTypes: { 
    day: React.PropTypes.instanceOf(Date), 
    events: React.PropTypes.array,
    timelineHeight: React.PropTypes.number,
    timelineGap: React.PropTypes.number,
  },

  defaultProps: { day: new Date(), events: [], timelineHeight: 1, timelineGap: 60 },

  componentWillMount: function() {
      this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onResponderTerminationRequest: this._onResponderTerminationRequest,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });

      this.draggableEventBoxStyle.top = this.draggableEventBoxPreviousTop;
  },

  componentDidMount: function() {
    // this._updateDraggableEventBoxPosition();

  },

  _updateDraggableEventBoxPosition: function() {
    this.draggableEventBox && this.draggableEventBox.setNativeProps({top: this.draggableEventBoxStyle.top});

  },

  _onResponderTerminationRequest: function() {
    console.log('onResponderTerminationRequest');
    return false;
  },

  // _handleStartShouldSetPanResponder: function(e, gestureState) {
  //   // Should we become active when the user presses down on the circle?
  //   return true;
  // },

  // _handleMoveShouldSetPanResponder: function(e, gestureState) {
  //   // Should we become active when the user moves a touch over the circle?
  //   return true;
  // },

  _handlePanResponderGrant: function(e, gestureState) {
    // this._highlight();
  },

  _handlePanResponderMove: function(e, gestureState) {
    this.draggableEventBoxStyle.top = this.draggableEventBoxPreviousTop + gestureState.dy;
    this._updateDraggableEventBoxPosition();
  },

  _handlePanResponderEnd: function(e, gestureState) {
    // this._unHighlight();
    console.log("_handlePanResponderEnd");
    this.draggableEventBoxPreviousTop += gestureState.dy;
  },

  render: function() {
    var createTimeline = (time, i) => <Timeline key={i} time={time} style={i == HOURS_COUNT-1 ? styles.timelineLast : styles.timeline} />;
    var beginOfDay = moment(this.props.day).hour(0).minute(0).second(0);
    var endOfDay = moment(this.props.day).hour(24).minute(0).second(0);

    var isEventInDay = (event) => !(endOfDay.isBefore(event.startAt) || beginOfDay.isAfter(event.endAt));
    var createEventBox = function (event, i) {


      var startAt = beginOfDay.isAfter(event.startAt) ? beginOfDay : moment(event.startAt);
      var endAt = endOfDay.isBefore(event.endAt) ? endOfDay : moment(event.endAt);

      startAt = startAt.second(0);
      endAt = endAt.second(0);

      var startAtInMinutes = startAt.diff(beginOfDay, 'minutes');
      var lengthInMinutes = endAt.diff(startAt, 'minutes');

      var totalHeight = (HOURS_COUNT-1) * (this.props.timelineGap + this.props.timelineHeight);
      
      var eventBoxTop = startAtInMinutes / MINUTES_INA_DAY * totalHeight;
      var eventBoxHeight = lengthInMinutes / MINUTES_INA_DAY * totalHeight;

      return (<EventBox style={{position: 'absolute', top: eventBoxTop, height: eventBoxHeight, left: 80, right: 20}} title={event.title} />);
    };

// {this.props.events.filter(isEventInDay).map(createEventBox.bind(this))}
    return (
      <ScrollView onStartShouldSetResponderCapture={(evt)=>false} onMoveShouldSetResponderCapture={(evt)=>false}>
        
        {HOURS.map(createTimeline)}
        
        
        <View ref={(box) => {this.draggableEventBox = box;}} style={this.draggableEventBoxStyle} {...this.panResponder.panHandlers}>
        <EventBox />
        </View>

      </ScrollView>
    );
  },
});


var styles = StyleSheet.create({
  eventContainer: {
    position: 'absolute',
    top: 0,
    paddingLeft: 90,
  },
  timeline: {
    height: 1,
    marginBottom: 60,
  },
  timelineLast: {
    height: 1,
  }
});

module.exports = DayCalendar;
