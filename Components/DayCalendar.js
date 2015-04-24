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
  resizeResponder: {},
  draggableViewPreviousTop: 0,
  draggableViewPreviousHeight: 0,
  draggableView: null,
  resizeHandleView: null,
  draggableViewTopAndHeight: {},
  scrollView: null,

  propTypes: {
    style: View.propTypes.style,
    eventBoxStyle: View.propTypes.style,
    day: React.PropTypes.instanceOf(Date), 
    events: React.PropTypes.array,
    newEvent: React.PropTypes.object,
    timelineHeight: React.PropTypes.number,
    timelineGap: React.PropTypes.number,
  },

  getDefaultProps: function() {
    return { day: new Date(), events: [], timelineHeight: 1, timelineGap: 59 };
  },

  getInitialState: function() {
    return {
      newEvent: this.props.newEvent
    };
  },

  componentWillMount: function() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
    this.resizeResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onPanResponderMove: this._handleResizeResponderMove,
      onPanResponderRelease: this._handleResizeResponderEnd,
      onPanResponderTerminate: this._handleResizeResponderEnd,
    });

    if (this.props.newEvent) {
      this.draggableViewTopAndHeight = this._topAndHeightFromEvent(this.props.newEvent);
      this.draggableViewPreviousTop = this.draggableViewTopAndHeight.top;
      this.draggableViewPreviousHeight = this.draggableViewTopAndHeight.height;
    }
  },

  componentDidMount: function() {
    this._updateDraggableViewPosition();
  },

  _updateDraggableViewPosition: function() {
    this.draggableView && this.draggableView.setNativeProps(this.draggableViewTopAndHeight);
  },

  _handleStartShouldSetPanResponder: function(e, gestureState) {
    // Should we become active when the user presses down on the circle?
    console.log('_handleStartShouldSetPanResponder');
    this.scrollView.setNativeProps({scrollEnabled: false});
    return true;
  },

  _handlePanResponderMove: function(e, gestureState) {
    this.draggableViewTopAndHeight.top = this.draggableViewPreviousTop + gestureState.dy;
    this._updateDraggableViewPosition();
  },
  _handleResizeResponderMove: function(e, gestureState) {
    this.draggableViewTopAndHeight.height = this.draggableViewPreviousHeight + gestureState.dy;
    this._updateDraggableViewPosition();
  },

  _handlePanResponderEnd: function(e, gestureState) {

    console.log("_handlePanResponderEnd");
    this.scrollView.setNativeProps({scrollEnabled: true});
    
    this.draggableViewPreviousTop += gestureState.dy;
  },
  _handleResizeResponderEnd: function(e, gestureState) {

    console.log("_handleResizeResponderEnd");
    this.scrollView.setNativeProps({scrollEnabled: true});

    this.draggableViewPreviousHeight += gestureState.dy;
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
    var timelineStyles = StyleSheet.create({
      timeline: {
        height: this.props.timelineHeight,
        marginBottom: this.props.timelineGap,
      },
      timelineLast: {
        height: this.props.timelineHeight,
      },
    });

    var createTimeline = (time, i) => <Timeline key={i} time={time} style={i == HOURS_COUNT-1 ? timelineStyles.timelineLast : timelineStyles.timeline} />;

    var createEventBox = (event, i) => {

      var topAndHeight = this._topAndHeightFromEvent(event);

      return (<EventBox style={[styles.eventBoxPosition, topAndHeight, this.props.eventBoxStyle]} title={event.title} />);
    };

    var createNewEventBox = (event) => {

      var topAndHeight = this._topAndHeightFromEvent(event);

      return (
        <View ref={(box) => {this.draggableView = box;}} style={[styles.eventBoxPosition, topAndHeight]} {...this.panResponder.panHandlers}>
          <EventBox style={this.props.eventBoxStyle} title={event.title}/>
          <View ref={(view) => {this.resizeHandleView = view;}} style={styles.resizeHandleView} {...this.resizeResponder.panHandlers}/>
        </View>
      );
    };

    return (
      <ScrollView ref={(scrollView) => {this.scrollView = scrollView;}}>
        
        {HOURS.map(createTimeline)}
        {this._filteredEvents().map(createEventBox)}
        {this.state.newEvent && createNewEventBox(this.state.newEvent)}

      </ScrollView>
    );
  },
});


var styles = StyleSheet.create({
  eventBoxPosition: {
    position: 'absolute', left: 80, right: 20,
  },
  resizeHandleView: {
    position: 'absolute', right:10, bottom: 0, width: 30, height: 20, backgroundColor: 'red'
  }
});

module.exports = DayCalendar;
