import React, { Component } from 'react';

class ImageUploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedImage: null
        };
    }

    handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState({ selectedImage: reader.result });
                this.props.onImageUpload(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    render() {
        return (
            <div className="image-uploader">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={this.handleImageUpload} 
                />
                {this.state.selectedImage && (
                    <img 
                        src={this.state.selectedImage} 
                        alt="Uploaded" 
                        style={{ width: '100px', height: '100px' }} 
                    />
                )}
            </div>
        );
    }
}

export default ImageUploader;