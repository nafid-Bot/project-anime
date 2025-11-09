import React from 'react';

const MovieCard = ({title,image,description,type,episodes,score}) => {
    return (
         <div>
            <img
                src={image}
                alt={title}
                className="w-full h-56 object-cover rounded-lg"
            />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="text-sm opacity-70">
                {type} • {episodes ?? "?"} eps • {score ?? "N/A"}⭐
            </p>
         </div>
    );
};

export default MovieCard;