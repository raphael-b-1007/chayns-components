import React from 'react';
import PropTypes from 'prop-types';

import SelectItem from './SelectItem';
import SelectItemInternal from './internal/SelectItemInternal';

const ANIMATION_TIMEOUT = 500;

export default class SelectList extends React.Component {
    static maxId = 0;

    static propTypes = {
        onChange: PropTypes.func,
        defaultId: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        selectFirst: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
        className: PropTypes.string,
    };

    static defaultProps = {
        className: null,
        defaultId: null,
        onChange: null,
        selectFirst: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedId: props.defaultId || 0,
            children: []
        };

        if(props.defaultId && props.onChange) {
            props.onChange(props.defaultId);
        }
    }

    componentWillMount() {
        this.selectListId = `cc_selectlist__${SelectList.maxId}`;
        SelectList.maxId += 1;

        this._cleanChildren(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this._cleanChildren(nextProps);
    }

    _cleanChildren(props) {
        const children = [];

        if(window.chayns.utils.isArray(props.children)) {
            props.children.map((child) => {
                if(child && child.type && child.type.componentName === SelectItem.componentName) {
                    if (child.props && (child.props.id || child.props.id === 0) && child.props.name) {
                        children.push(child);
                    }
                }
            });
        }

        if(this.state.selectedId === 0 && props.selectFirst && children.length > 0) {
            this._selectFirstItem(children);
        }

        this.setState({
            children
        });
    }

    _changeActiveItem = (id) => {
        if(id === this.state.selectedId) return;

        if(this.changing) return;

        this.changing = true;

        window.setTimeout(() => {
            this.changing = false;
        }, ANIMATION_TIMEOUT);

        this.setState({
            selectedId: id
        });

        if(this.props.onChange) {
            this.props.onChange(id);
        }
    };

    _selectFirstItem(children) {
        for(let i = 0, z = children.length; i < z; i += 1) {
            const props = children[i].props;

            if(!props.disabled) {
                this._changeActiveItem(props.id);
                return;
            }
        }
    }

    _renderChildren(children) {
        if(children.length === 1) return children;

        return children.map((child) => {
            const id = child.props.id;

            return (
                <SelectItemInternal
                    id={id}
                    selectListId={this.selectListId}
                    onChange={this._changeActiveItem}
                    checked={id === this.state.selectedId}
                    disabled={child.props.disabled}
                    key={id}
                    name={child.props.name}
                    className={child.props.className}
                >

                    {child}
                </SelectItemInternal>
            );
        });
    }


    render() {
        if(this.state.children.length > 0) {
            return (
                <div className={this.props.className}>
                    {this._renderChildren(this.state.children)}
                </div>
            );
        }

        return null;
    }
}
