import React from 'react';
import { StyleSheet, Text, View, StatusBar, Button } from 'react-native';
import * as Animatable from 'react-native-animatable';

class AikoMessage extends React.Component {
	render() {
	  return (
		<Animatable.View animation="fadeIn" duration={1000} style={styles.aikoMessage}>
		  <Text style={styles.sender}>{this.props.sender}</Text>
		  <View style={styles.messageInner}>
			<Text style={styles.messageText}>{this.props.message}</Text>
		  </View>
		</Animatable.View>
	  );
	}
  }
  
  class AikoRepeatingMessage extends React.Component {
	render() {
	  return (
		<Animatable.View animation="fadeIn" duration={1000} style={styles.aikoMessageRepeat}>
		  <View style={styles.messageInner}>
			<Text style={styles.messageText}>{this.props.message}</Text>
		  </View>
		</Animatable.View>
	  );
	}
  }
  
  class Choices extends React.Component {
	render() {
	  return(
		<Animatable.View animation="fadeIn" duration={2000} style={styles.choices}>
			{this.props.choices}
		</Animatable.View>
	  )
	}
  }
	class UserMessage extends React.Component {
		render() {
			return (
			<Animatable.View animation="fadeIn" duration={1000} style={styles.userMessage}>
				<Text style={styles.sender}>{this.props.sender}</Text>
				<View style={styles.messageInner}>
				<Text style={styles.messageText}>{this.props.message}</Text>
				</View>
			</Animatable.View>
			);
		}
		}

  export {
	  AikoMessage,
		AikoRepeatingMessage,
		UserMessage,
	  Choices
  }

const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  backgroundColor: '#49446C'
	},
	forefront: {
	  flex: 1,
	  backgroundColor: '#DCDCDA',
	  marginLeft: 10,
	  marginRight: 10,
	  marginTop: 23,
	  marginBottom: 10,
	  borderRadius: 10,
	  borderWidth: 3,
	  borderStyle: 'dashed',
	  borderColor: '#b8b8b8',
	  flexDirection: 'column',
	  alignItems: 'center'
	},
	aikoMessage: {
	  marginTop: 15,
		marginLeft: 10
	},
	userMessage: {
		marginTop: 15,
		marginRight: 10,
		alignSelf: 'flex-end'
	},
	aikoMessageRepeat: {
	  marginTop: 5,
		width: 300,
		marginLeft: 10
	},
	messageInner: {
	  backgroundColor: '#FFFFFF',
	  borderRadius: 10,
	  width: 300,
	  height: 50,
	  flexDirection: 'row',
	  justifyContent: 'flex-start',
	  alignItems: 'center',
	  paddingLeft: 20,
	  paddingTop: 10,
	  paddingBottom: 10,
	  paddingRight: 20
	},
	messageText: {
	  color: '#948075',
	  fontWeight: "400"
	},
	sender: {
	  color: '#948075',
	  fontWeight: "900",
	  fontSize: 12,
	  marginLeft: 5,
	  marginBottom: 2
	},
	choices: {
	  marginTop: 20,
	  justifyContent: 'center',
		alignItems: 'center',
		display: 'flex'
	},
	choice: {
	  width: 100,
	  height: 50,
	  backgroundColor: 'white',
	  borderRadius: 10
	}
  });
  