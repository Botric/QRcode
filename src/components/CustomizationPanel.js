import React, { Component } from 'react';

class CustomizationPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: '#000000',
            shape: 'square',
            image: null,
        };
    }

    handleColorChange = (event) => {
        this.setState({ color: event.target.value });
        this.props.onCustomizationChange({ color: event.target.value });
    };

    handleShapeChange = (event) => {
        this.setState({ shape: event.target.value });
        this.props.onCustomizationChange({ shape: event.target.value });
    };

    handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState({ image: reader.result });
                this.props.onCustomizationChange({ image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    render() {
        return (
            <div className="customization-panel">
                <h3>Customize Your QR Code</h3>
                <label>
                    Color:
                    <input
                        type="color"
                        value={this.state.color}
                        onChange={this.handleColorChange}
                    />
                </label>
                <label>
                    Shape:
                    <select value={this.state.shape} onChange={this.handleShapeChange}>
                        <option value="square">Square</option>
                        <option value="circle">Circle</option>
                    </select>
                </label>
                <label>
                    Upload Image:
                    <input type="file" accept="image/*" onChange={this.handleImageUpload} />
                </label>
            </div>
        );
    }
}

export default CustomizationPanel;