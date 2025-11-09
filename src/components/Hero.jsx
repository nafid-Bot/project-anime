import React from 'react';

const Hero = ({ leftImage, centerImage, rightImage }) => {
    return (
        <div>
            <header className="main-header">
                <div className="relative flex justify-center items-center h-[320px] sm:h-[360px] md:h-[400px] lg:h-[460px]">
                    {/* Left Image */}
                    <img
                        src={leftImage}
                        alt="Jujutsu Kaisen"
                        className="w-40 sm:w-48 lg:w-52 h-64 sm:h-72 object-cover rounded-lg shadow-2xl absolute z-10 transform -rotate-10 -translate-x-[80%] sm:-translate-x-[60%] md:-translate-x-[50%] lg:-translate-x-[50%]"
                    />

                    {/* Center Image */}
                    <img
                        src={centerImage}
                        alt="Naruto"
                        className="w-44 sm:w-52 lg:w-56 h-70 lg:h-80 sm:h-72 object-cover rounded-lg shadow-2xl relative z-20"
                    />

                    {/* Right Image */}
                    <img
                        src={rightImage}
                        alt="One Piece"
                        className="w-40 sm:w-48 lg:w-52 h-64 sm:h-72 object-cover rounded-lg shadow-2xl absolute z-10 transform rotate-10 translate-x-[80%] sm:translate-x-[60%] md:translate-x-[50%] lg:translate-x-[65%] transform: scaleX(-1) scale-x-[-1] ;"
                    />
                </div>
            </header>
        </div>
    );
};

export default Hero;
