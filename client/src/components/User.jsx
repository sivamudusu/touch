import React from "react"
import { useEffect,useState } from "react";




const User = ()=>{
    let [customer,setCustomer] = useState("");
    let [count,setCount] = useState(1);

    useEffect(()=>{
        async function fetchData(){
            try{
                const url = `${baseURL+"/users/"+count}`
                const user = await fetch(url);
                const response = await user.json();
                if(user){
                    setCustomer(response.name.toString())
                    console.log(customer);
                }
            }catch(err){
                console.log(err);
            }
        
        }

        fetchData();
    },[count,customer])

    const handleClick = ()=>{
        setCount(++count)
        console.log(count);
    }

   
    return(
        <>
        <div>hello this is the user is {customer} </div>
        <button onClick={handleClick}></button>
        </>
        
    )

}
export default User;
