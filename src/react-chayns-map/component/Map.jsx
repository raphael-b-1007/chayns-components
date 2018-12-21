import React from 'react';
import PropTypes from 'prop-types';
import Input from '../../react-chayns-input/component/Input';
import MapMarker from './MapMarkerComp';
import './admin.scss';

export default class Map extends React.Component {
    static propTypes = {
        defaultPosition: PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lng: PropTypes.number.isRequired
        }).isRequired,
        mapId: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]).isRequired,
        apiKey: PropTypes.string.isRequired,
        mapOptions: PropTypes.shape({
            defaultZoom: PropTypes.number,
            onPositionChange: PropTypes.func,
            disableDefaultUI: PropTypes.bool,
            reference: PropTypes.func,
            disableDefaultStyles: PropTypes.bool,
            mapStyles: PropTypes.arrayOf(PropTypes.shape({
                featureType: PropTypes.string,
                elementType: PropTypes.string,
                stylers: PropTypes.arrayOf(PropTypes.object),
            })),

        }),
        inputOptions: PropTypes.shape({
            onInputChange: PropTypes.func,
            inputRef: PropTypes.func,
            placeholder: PropTypes.string
        }),
        markerOptions: PropTypes.shape({
            icon: PropTypes.object,
            bgImg: PropTypes.string,
            onIconClick: PropTypes.func,
        }),

    };

    static defaultProps = {
        mapOptions: {
            defaultZoom: 13,
            disableDefaultUI: false,
            disableDefaultStyles: false,
            onPositionChange: () => {
            },
            reference: () => {
            },
            mapStyles: [],
        },
        inputOptions: {
            onInputChange: () => {
            },
            inputRef: () => {
            },
            placeholder: ''
        },
        markerOptions: {
            icon: null,
            bgImg: '',
            onIconClick: () => {
            },
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            adr: '',
            pos: props.defaultPosition
        };
        this.mapRef = null;
    }

    componentDidMount() {
        this.getAddress(this.state.pos);
        this.loadScript().then(() => {
            this.initMap().then(() => {
                this.concatMapStyles();

            }).catch((err) => {
                // Logger.error('Count not init Map', { er: err }, 'Map componentDidMount', 67, err.message);
            });
        });
    }

    getAddress(geopoint) {
        // eslint-disable-next-line no-undef
        const address = new google.maps.Geocoder();
        address.geocode({location: geopoint}, (result, status) => {
            if (status === 'OK') {
                let adrs = result[0].formatted_address.split(/(.+),/)[1];
                adrs = adrs.substring(0, adrs.indexOf(','));
                this.setState({
                    adr: adrs
                });
            }
        });
    }

    concatMapStyles() {
        const defaultStyles = [{
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [{
                visibility: 'on'
            }]
        }, {
            featureType: 'landscape',
            elementType: 'labels',
            stylers: [{
                visibility: 'off'
            }]
        }, {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{
                visibility: 'off'
            }]
        }, {
            featureType: 'water',
            elementType: 'labels',
            stylers: [{
                visibility: 'off'
            }]
        }];
        if (!this.props.mapOptions.disableDefaultStyles) {
            this.mapStyles = defaultStyles.concat(this.props.mapOptions.mapStyles);
        } else {
            this.mapStyles = this.props.mapOptions.mapStyles;

        }
    }


    loadScript() {
        return new Promise((resolve) => {
            if (!document.querySelector('#googleMapsScript')) {
                const script = document.createElement('script');
                script.id = 'googleMapsScript';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${this.props.apiKey}`;
                script.async = true;
                document.body.appendChild(script);
                resolve();
            }
            resolve();
        });
    }


    initMap() {
        const {
            mapOptions,
            onPositionChange,
            defaultPosition
        } = this.props;
        const {
            defaultZoom,
            disableDefaultUI,
        } = mapOptions;
        return new Promise((resolve, reject) => {
            try {
                // eslint-disable-next-line no-undef
                this.mapRef = new google.maps.Map(this.map, {
                    zoom: defaultZoom,
                    center: defaultPosition,
                    disableDefaultUI: disableDefaultUI,
                    styles: this.mapStyles
                });
                this.mapRef.addListener('center_changed', () => {
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        const center = this.mapRef.getCenter();
                        const currentPos = {lat: center.lat(), lng: center.lng()};
                        this.getAddress(currentPos);
                        onPositionChange(currentPos);
                    }, 500);
                });
            } catch (err) {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject({
                    message: 'Error in google.maps',
                    error: err
                });
                return;
            }

            if (this.mapRef === null) {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject({
                    message: 'Map is null'
                });
                return;
            }
            this.props.mapOptions.reference(this.mapRef);

            resolve();
        });
    }

    render() {
        const {
            onIconClick,
            icon,
            bgImg
        } = this.props.markerOptions;
        return (
            <div id="map_comp">
                <div
                    className="mapBorder"
                >
                    <div
                        className="centerMarker"

                    >
                        <MapMarker
                            onClick={() => {
                                onIconClick();
                            }}
                            icon={icon}
                            bgImg={bgImg}
                            style={{transform: 'scale(1.5)'}}

                        />
                    </div>
                    <div
                        className="mapDiv"
                        ref={(el) => {
                            this.map = el;
                        }}
                        id={`map${this.props.mapId}`}

                    />
                </div>
                <div
                    id="map__comp--overlay"
                    className="chayns__background-color--shade-1"
                >
                    <MapMarker
                        onClick={() => {
                            onIconClick();
                        }}
                        icon={icon}
                        bgImg={bgImg}
                        style={{transform: 'scale(1.3)'}}

                    />
                    <Input
                        placeholder={this.props.inputOptions.placeholder}
                        value={this.state.adr}
                        key="adr"
                        inputRef={(obj) => {
                            this.props.inputOptions.inputRef(obj);
                        }}
                        onChange={(adr) => {
                            this.setState({
                                adr
                            });
                            this.props.inputOptions.onInputChange(adr);
                        }}
                    />
                </div>
            </div>
        );
    }
}