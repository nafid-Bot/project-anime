import React from 'react';

const Hero = ({leftImage,centerImage,rightImage}) => {
    return (
        <div>

            <header className="main-header">
                <div className="relative flex justify-center items-center">
                    <img
                        src={leftImage}
                        alt="Jujutsu Kaisen"
                        className="w-52 h-72 object-cover rounded-lg shadow-2xl absolute -rotate-10 left-0.5"
                    />
                    <img
                        src={centerImage}
                        alt="Naruto"
                        className="w-52 h-79 object-cover rounded-lg shadow-2xl relative z-20"
                    />
                    <img
                        src={rightImage}
                        alt="One Piece"
                        className="w-52 h-72 object-cover rounded-lg shadow-2xl absolute rotate-10 -right-0.5"
                    />
                </div>

            </header>
            
        </div>
    );
};

export default Hero;