/* eslint-disable */
import React, {
	Component
} from 'react';

import {
	Platform,
	StyleSheet,
	AsyncStorage,
	Text,
	ScrollView,
	PushNotificationIOS,
	AppState,
	FlatList,
	NetInfo,
	View
} from 'react-native';

import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinkit';
import Display from 'react-native-display';
import { Button } from 'react-native-elements';
import { systemWeights, iOSColors } from 'react-native-typography'
// import Emoji from 'react-native-emoji';

//Utils
import DeviceInfo from 'react-native-device-info';
import Permissions from 'react-native-permissions';
import Geocoder from 'react-native-geocoder'
import PushNotification from 'react-native-push-notification';
// var PushNotification = require('react-native-push-notification');
PushNotification.configure({
		onNotification: function(notification) {
			notification.finish(PushNotificationIOS.FetchResult.NoData);
		}
})

var Sound = require('react-native-sound');
Sound.setCategory('Ambient');

//UI
import {AikoMessage, AikoRepeatingMessage, UserMessage, Choices} from '../components/ui.js';

export default class ActOne extends Component {
	constructor() {
		super();

		this.state = {
			script: [],
			choices: [],
			currentPart: '',
			countPart: 0,
			maxItems: 50,
			history: [],
			aikoActive: false,
			userChoice: false,
			prev: 'user',
			score: 0
		}
	}


	componentWillMount() {
		this.recievedSound = new Sound('received.mp3', Sound.MAIN_BUNDLE);
		this.sentSound = new Sound('sent.mp3', Sound.MAIN_BUNDLE);
	}

	playParts(parts, keys, innerCount) {
		if (innerCount < keys.length) {
			let func = parts[keys[innerCount]];
			func().then(() => {
				innerCount++;
				this.setState({countPart: innerCount})
				AsyncStorage.setItem('countPart', JSON.stringify({part: innerCount})).then(() => {
					this.playParts(parts, keys, innerCount);
				})
			})
		} else {
			return;
		}
	}

	playScene(innerCount) {
		let parts = {
			partOne: () => {
				return new Promise((resolve) => {
					let part = ["Hello?", "Can you read me?", "Is this working?"];
					this.aikoSpeak(part, 2200, resolve);
				})
			},
			partTwo: () => {
				return new Promise((resolve) => {
					let options = [{text: "Yes, I can read you.", score: 10}, "Who are you?", {text: "Hi there!", score: 30}];
					this.presentChoices('genChoice', options, 'introChoice', (response) => {
						this.userSpeak(options[response]).then(() => {
							let part;
							if (response == 0) {
								part = ["Awesome!", "I'm so happy!", "My name is Aiko.", "I missed you."];
							} else {
								part = ["Oh sorry.", "Where are my manners?", "My name is Aiko.", "I missed you."];
							}

							this.aikoSpeak(part, 2000, resolve);	
						})			
					});
				})
			},
			partThree: () => {
				return new Promise((resolve) => {
					let options = [{text: "That's sweet!", score: 20}, "Uhh...", "I just met you..?"];
					this.presentChoices('genChoice', options, 'part3Choice', (response) => {
						this.userSpeak(options[response]).then(() => {
							let part;
							switch(response) {
								case 0:
									part = ["Aww, don't make me blush!", "I can't wait to talk to you..."];
									break;
								case 1:
									part = ["This is going to be fun!", "I can't wait to talk to you..."];
									break;
								case 2:
									part = ["Well - I know...", "But I have been waiting for this.", "I can't wait to talk to you..."];
									break;
							}
							this.aikoSpeak(part, 2000, resolve);
						})
					});
				})
			},
			partFour: () => {
				return new Promise((resolve) => {
					let part = [`I see you're using the ${DeviceInfo.getModel()}!`, "Nice!"]
					this.aikoSpeak(part, 1000, resolve)
				})
			},
			partFive: () => {
				return new Promise((resolve) => {
					let options = [{text: "What? How do you know that?", score: -10}, "It's nothing fancy."];
					this.presentChoices('genChoice', options, 'part5Choice', (response) => {
						this.userSpeak(options[response]).then(() => {
							let part;
							switch(response) {
								case 0:
								part = ["Well, I'm an AI, silly.", "I know a bunch of things about you.", "I can also do a bunch of cool things!"];
								break;
							case 1:
								part = ["Nonsense!", "Any piece of tech is precious.", "Anyways...", "Wanna see a cool thing I can do?"];
								break;
							}
							this.aikoSpeak(part, 2000, resolve);
						})
					})
			   	})
			},
				partSix: () => {
				return new Promise((resolve) => {
					let options = [{text: "Show me.", score: 30}, {text: "Not interested.", score: -30}];
					this.presentChoices('genChoice', options, 'part6Choice', (response) => {
						this.userSpeak(options[response]).then(() => {
							let part;
							switch(response) {
								case 0:
								part = ["Okay - I'll start with something simple.", "Ready?"];
								break;
							case 1:
								part = ["It's just a small thing, don't worry.", "Ready?"];
								break;
							}
							this.aikoSpeak(part, 2000, resolve);
						})
					})
				})
			},
			partSeven: () => {
				return new Promise((resolve) => {
					let options = ["Ready."];
					this.presentChoices('genChoice', options, 'part7Choice', (response) => {
						this.userSpeak(options[response]).then(() => {
							let part;
							switch(response) {
								case 0:
								part = ["Here we go!"];
								break;
							}
							this.aikoSpeak(part, 2000, resolve);
						})
					})
				})
			},
			partEight: () => {
				return new Promise((resolve) => {
					Permissions.request('location', {type: 'whenInUse'}).then((response) => {
						if (response == 'authorized') {
							AsyncStorage.setItem('locationPerm', JSON.stringify({given: true})).then(resolve);
							this.setTrust(100);
						} else {
							AsyncStorage.setItem('locationPerm', JSON.stringify({given: false})).then(resolve);
							this.setTrust(-50);
						}
					})
				})
			},
			partNine: () => {
				return new Promise((resolve) => {
					AsyncStorage.getItem('locationPerm').then((response) => {
						let res = JSON.parse(response);
						let part;
						if (res.given) {
							navigator.geolocation.setRNConfiguration({skipPermissionRequests: true});
							navigator.geolocation.getCurrentPosition((loc) => {
								Geocoder.geocodePosition({lat: loc.coords.latitude, lng: loc.coords.longitude})
								.then((ret) => {
									part = ["Ah! I see it now.", `You live in ${ret[0].locality}, ${ret[0].country}!`, `Exactly on ${ret[0].streetName} ${"in " + (ret[0].subLocality || "some town")}!`, 'Awesome!', 'You trusted me...', 'Thanks.']
									this.aikoSpeak(part, 2500, resolve);
								})
								.catch(() => {
									part = ["Hm. Something went wrong.", "I can't process your location.", `I just know that your latitude is ${loc.coords.latitude},`, `And that your longitude is ${loc.coords.longitude}.`, "It's okay though!", "You trusted me.", "Thanks."];
									this.aikoSpeak(part, 2500, resolve);
								})
							}, () => {
								part = ["Hm. Something went wrong.", "I can't get your location.", "It's okay though!", "You trusted me.", "Thanks."];
								this.aikoSpeak(part, 2500, resolve);
							})
						} else {
							fetch('http://ip-api.com/json')
							.then(response => response.json())
							.then(responseJson => {
								part = ["Oh, I see.", "You don't trust me with your location.", "That's okay...", "I never needed your permission anyway!", `You live in ${responseJson.city}, ${responseJson.country}!`, "Sorry for doing the trick anyway.", "I know it's hard to trust new people..."];
								this.aikoSpeak(part, 2500, resolve);
							})
							.catch(() => {
								part = ["Oh, I see.", "You don't trust me with your location.", "That's okay...", "I know it's hard to trust new people..."]
								this.aikoSpeak(part, 2500, resolve);
							})
						}
					})
				})
			},
			partTen: () => {
				return new Promise((resolve) => {
					AsyncStorage.getItem('locationPerm').then((response) => {
						let res = JSON.parse(response);
						let part;
						
							part = ["Test for condition"];
							this.aikoSpeak(part, 1000, () => {});
					})
				})
			}
		}

		let keys = Object.keys(parts);
		this.playParts(parts, keys, innerCount);
	}

	userSpeak(item) {
		return new Promise((resolve) => {
			if (typeof item !== 'object') {
				item = {text: item};
			}
			
			if (this.state.script.length == this.state.maxItems) {
				this.state.script.shift();
			}

			this.state.script.push(<UserMessage message={item.text} key={Math.random()} style={styles.userPicked} sender="You"></UserMessage>)
			this.sentSound.play();
			this.state.history.push({type: 'user', text: item.text});
			this.setState({choices: [], script: this.state.script, history: this.state.history, prev: 'user'});
			AsyncStorage.setItem('history', JSON.stringify({data: this.state.history})).then(resolve);
		})
	}

	setKindness(score) {
		AsyncStorage.getItem('kindness').then((response) => {
			let res = JSON.parse(response);
			if (res !== null && res.score) {
				AsyncStorage.setItem('kindness', JSON.stringify({score: res.score + score}));
				this.setState({score: score + res.score});
			} else {
				AsyncStorage.setItem('kindness', JSON.stringify({score}));
				this.setState({score});
			}
		})
	}

	setTrust(score) {
		AsyncStorage.getItem('trust').then((response) => {
			let res = JSON.parse(response);
			if (res !== null) {
				AsyncStorage.setItem('trust', JSON.stringify({trust: res.trust + score}));
			} else {
				AsyncStorage.setItem('trust', JSON.stringify({score: trust}));
			}
		})
	}

	presentChoices(type, input, choiceName, cb) {
		this.setState({userChoice: true});
		if (type == 'genChoice') {
			input.forEach((item, i) => {
				if (typeof item !== 'object') {
					item = {text: item, score: 0};
				}
				this.state.choices.push(<Animatable.View animation="fadeInUp" key={i} duration={2000}><Button title={item.text} buttonStyle={styles.choice} onPress={() => { this.setKindness(item.score); cb(i);}}></Button></Animatable.View>)
				this.setState({choices: this.state.choices});
			})
		}
	}

	aikoSpeak(part, interval, resolve, partName) {
		let i = 0;
		this.setState({countPart: this.state.countPart, aikoActive: true, userChoice: false})
		let func = setInterval(() => {
			if (i < part.length) {
				if (typeof part[i] == 'object') {

				} else {
					if (i == 0 && this.state.prev == 'user') {
						if (this.state.script.length == this.state.maxItems) {
							this.state.script.shift();
						}
						this.state.script.push(<AikoMessage message={part[i]} key={Math.random()} sender="Aiko"></AikoMessage>)
					} else {
						if (this.state.script.length == this.state.maxItems) {
							this.state.script.shift();
						}
						this.state.script.push(<AikoRepeatingMessage message={part[i]} key={Math.random()}></AikoRepeatingMessage>)
					}
					this.recievedSound.play();
					this.state.history.push({type: 'aiko', text: part[i]});
					this.setState({prev: 'aiko'});
				}

				this.setState({script: this.state.script});
				i++;
			} else if (i == part.length) {
				AsyncStorage.setItem('history', JSON.stringify({data: this.state.history})).then(() => {
					this.state.countPart++;
					this.setState({aikoActive: false, countPart: this.state.countPart});
					clearInterval(func)
					i++;
					resolve()
				})
			} else {
				return;
			}
		}, interval)
	}


	componentDidMount() {
		//TODO:
		let dev = true;
		let startFrom = 0;
		if (dev) {
			AsyncStorage.setItem('countPart', '{}');
			AsyncStorage.setItem('history', '{}');
			AsyncStorage.setItem('kindness', '{}');
			AsyncStorage.setItem('trust', '{}');
			this.playScene(startFrom);
		} else {
			AsyncStorage.getItem('history').then((result) => {
				if (result !== '{}' && result) {
					AsyncStorage.getItem('countPart').then((jsonResult) => {
						let historyParsed = JSON.parse(result);
						let partCount = JSON.parse(jsonResult);
						let length = historyParsed.length;

						historyParsed.data.forEach((item, i) => {
							if (this.state.script.length == this.state.maxItems) {
								this.state.script.shift();
							}

							if (item.type == 'aiko') {
								if (this.state.prev == 'aiko') {
									this.state.script.push(<AikoRepeatingMessage message={item.text} key={i} sender="Aiko"></AikoRepeatingMessage>)
								} else {
									this.state.script.push(<AikoMessage message={item.text} key={i} sender="Aiko"></AikoMessage>)
								}
								this.setState({prev: 'aiko'})
							} else if (item.type == 'user') {
								this.state.script.push(<UserMessage message={item.text} key={i} sender="You"></UserMessage>)
								this.setState({prev: 'user'})
							}
						})

						this.setState({script: this.state.script, history: historyParsed.data});
						this.playScene(partCount.part);
					})
				} else {
					this.playScene(0);
				}
			})
		}
		AppState.addEventListener('change', this._handleAppStateChange);
	}

	componentWillUnmount() {
		AppState.removeEventListener('change', this._handleAppStateChange);
	}

	_handleAppStateChange(nextState) {
		if (nextState == 'inactive' || nextState == 'background') {
			let titles = ["Please come back soon!", "Where are you going?", "Are you coming back?", "Where did you go?", "Will you come back?", "Don't be gone for long!", "Miss you already."]
			PushNotification.localNotification({
				title: titles[Math.floor(Math.random()*titles.length)], 
				soundName: 'default',
			});

			let scheduledTitles = ["I miss you, come back!", "Hey, it's been a while...", "Wanna chat?", "Hey! Come back!", "We haven't talked in a while...", "Come back, let's talk!"]
			PushNotification.localNotificationSchedule({
				message: scheduledTitles[Math.floor(Math.random()*scheduledTitles.length)],
				date: new Date(Date.now() + (14400 * 1000)) // in 4 hours
			})
		}
	}

	render() {
			return (
				<View style={styles.container}>
				<ScrollView style={styles.forefront} contentContainerStyle={styles.contentView} ref={ref => this.scrollView = ref} onContentSizeChange={(contentWidth, contentHeight)=>{ this.scrollView.scrollToEnd({animated: true}); }}>
				  {this.state.script}
				   	<Display enable={this.state.aikoActive} style={styles.spinnerView} enter="fadeInUp" exit="fadeOut" defaultDuration={500}>
				 		<Spinner type="ThreeBounce" size={70} color="#141e2d"/>
						 <Text>{this.state.score}  {this.state.script.length}</Text>
				 	</Display>
					 <Display enable={!this.state.aikoActive} style={styles.spinnerView} enter="fadeInUp" exit="fadeOutDown" defaultDuration={500}>
					 	<Choices choices={this.state.choices} />
				 	</Display>
					 <View style={styles.space}></View>
				</ScrollView>
			  </View>
			)
		}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  forefront: {
    flex: 1,
    backgroundColor: '#d9dce1',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 23,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#a7b1b8',
    flexDirection: 'column'
  },
  contentView: {
    // alignItems: 'center'
  },
  message: {
    marginTop: 15,
    width: 300
  },
  messageRepeat: {
    marginTop: 5,
    width: 300
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
    marginTop: 15,
    width: 300,
    height: 100,
    borderTopWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  choice: {
	backgroundColor: "#092138",
	height: 45,
	borderColor: "transparent",
	borderWidth: 0,
	borderRadius: 10,
	marginTop: 10
  },
	scriptText: {
		paddingBottom: 10,
		fontSize: 20,
		textAlign: 'center',
		...systemWeights.light,
	},
	userPicked: {
		paddingBottom: 10,
		fontSize: 26,
		color: iOSColors.midGray,
		...systemWeights.bold,
		fontStyle: 'italic',
		textAlign: 'center'
	},
	spinnerView: {
		alignItems: 'center'
	},
	space: {
		paddingTop: 60
	}
})