import React, { useState } from 'react';


interface Pet {
  id: number;
  title: string;
  name: string;
}

const pets: Pet[] = [
  { id: 101, title: "dog", name: "lucky" },
  { id: 102, title: "cat", name: "kitty" },
];


export const MyHook: React.FC = () => {

const [count, setCount] = useState(0);


  return (
  <div >
      <h3>Fruit List</h3>
      <button className="p-4 border rounded" onClick={() => {
        setCount(count+3);
        alert(count);  
      }}>
      Count is: {count}
      <br/>
      Count is 23: {count}
    </button>
    </div>
  );
};
