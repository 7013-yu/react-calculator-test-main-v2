import React from 'react';


interface Pet {
  id: number;
  title: string;
  name: string;
}

const pets: Pet[] = [
  { id: 101, title: "dog", name: "lucky" },
  { id: 102, title: "cat", name: "kitty" },
];


export const MyView: React.FC = () => {




  return (
  <div className="p-4 border rounded">
      <h3>Fruit List</h3>
      <ul>

        {/* map 的用法不變，但現在 TS 知道 'fruit' 是一個 string */}
        {pets.map((pet) => (
          <div key={pet.id} className="flex items-center p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-4 w-full max-w-md">
            <span  className="font-semibold text-gray-600 w-1/3 flex-shrink-0"> {pet.title} </span>
            <input className="w-2/3 ml-4 p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out" type='text' value={pet.name} /> 
          </div>
          
        ))}
      </ul>
    </div>
  );
};
