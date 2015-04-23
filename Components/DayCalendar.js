'use strict';

var React = require('react-native');
var Timeline = require('./Timeline');
var EventBox = require('./EventBox');
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
  draggableViewPreviousTop: 0,
  draggableView: null,
  draggableViewTopAndHeight: {},
  scrollView: null,

  propTypes: { 
    day: React.PropTypes.instanceOf(Date), 
    events: React.PropTypes.array,
    newEvent: React.PropTypes.object,
    timelineHeight: React.PropTypes.number,
    timelineGap: React.PropTypes.number,
  },

  getDefaultProps: function() {
    return { day: new Date(), events: [], newEvent: null, timelineHeight: 1, timelineGap: 59 };
  },

  componentWillMount: function() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderTerminationRequest: this._onResponderTerminationRequest,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });

    if (this.props.newEvent) {
      this.draggableViewTopAndHeight = this._topAndHeightFromEvent(this.props.newEvent);
      this.draggableViewPreviousTop = this.draggableViewTopAndHeight.top;
    }
  },

  componentDidMount: function() {
    this._updateDraggableViewPosition();
  },

  _updateDraggableViewPosition: function() {
    this.draggableView && this.draggableView.setNativeProps(this.draggableViewTopAndHeight);
  },

  _onResponderTerminationRequest: function() {
    console.log('onResponderTerminationRequest');
    return false;
  },

  _handleStartShouldSetPanResponder: function(e, gestureState) {
    // Should we become active when the user presses down on the circle?
    console.log('_handleStartShouldSetPanResponder');
    this.scrollView.setNativeProps({scrollEnabled: false});
    return true;
  },

  _handleMoveShouldSetPanResponder: function(e, gestureState) {
    // Should we become active when the user moves a touch over the circle?
    return true;
  },

  _handlePanResponderGrant: function(e, gestureState) {
    // this._highlight();
  },

  _handlePanResponderMove: function(e, gestureState) {
    this.draggableViewTopAndHeight.top = this.draggableViewPreviousTop + gestureState.dy;
    this._updateDraggableViewPosition();
  },

  _handlePanResponderEnd: function(e, gestureState) {
    // this._unHighlight();
    console.log("_handlePanResponderEnd");
    this.scrollView.setNativeProps({scrollEnabled: true});
    this.draggableViewPreviousTop += gestureState.dy;
  },

  _beginOfDay: function() {
    return moment(this.props.day).hour(0).minute(0).second(0);
  },

  _endOfDay: function () {
    return moment(this.props.day).hour(24).minute(0).second(0);
  },

  _topAndHeightFromEvent: function(event) {
    var beginOfDay = this._beginOfDay();
    var endOfDay = this._endOfDay();

    var startAt = beginOfDay.isAfter(event.startAt) ? beginOfDay : moment(event.startAt);
    var endAt = endOfDay.isBefore(event.endAt) ? endOfDay : moment(event.endAt);

    startAt = startAt.second(0);
    endAt = endAt.second(0);

    var startAtInMinutes = startAt.diff(beginOfDay, 'minutes');
    var lengthInMinutes = endAt.diff(startAt, 'minutes');

    var totalHeight = (HOURS_COUNT-1) * (this.props.timelineGap + this.props.timelineHeight);
    
    var top = startAtInMinutes / MINUTES_INA_DAY * totalHeight;
    var height = lengthInMinutes / MINUTES_INA_DAY * totalHeight;

    return {top, height};
  },

  _isEventInDay: function(event) {
    var beginOfDay = this._beginOfDay();
    var endOfDay = this._endOfDay();
    return !(endOfDay.isBefore(event.startAt) || beginOfDay.isAfter(event.endAt));
  },

  _filteredEvents: function() {
    return this.props.events.filter(this._isEventInDay);
  },

  render: function() {
    var createTimeline = (time, i) => <Timeline key={i} time={time} style={i == HOURS_COUNT-1 ? styles.timelineLast : styles.timeline} />;

    var eventBoxBaseStyle = {position: 'absolute', left: 80, right: 20, borderRadius: 3, overflow: 'hidden', borderColor: 'rgba(195, 226, 242, 1.0)', borderWidth: 1.0};

    var createEventBox = (event, i) => {

      var topAndHeight = this._topAndHeightFromEvent(event);

      return (<EventBox style={[eventBoxBaseStyle, topAndHeight]} title={event.title} />);
    };

    var createNewEventBox = (event) => {

      var topAndHeight = this._topAndHeightFromEvent(event);

      return (
        <View ref={(box) => {this.draggableView = box;}} style={[eventBoxBaseStyle, topAndHeight]} {...this.panResponder.panHandlers}>
          <EventBox />
        </View>
      );
    };

    return (
      <ScrollView ref={(scrollView) => {this.scrollView = scrollView;}}>
        
        {HOURS.map(createTimeline)}
        {this._filteredEvents().map(createEventBox)}
        {this.props.newEvent && createNewEventBox(this.props.newEvent)}

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
