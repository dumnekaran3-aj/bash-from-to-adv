const express = require('express')


const port = 8000

server.express();


server.get('/api/health', (req,res)=>{

return res.status(200).json({ msg  :"server health good server running "

})

let users = [{

     "name":"vaibhav","role":"admin","id":"123456",
     "name" :"aryan","role":"moder","id":"9876543",
     "name" :"aryan","role":"moder","id":"6789054"
}]

server.get('/api/public/user',(req, res) =>{

   return res.status(200).json({msg :"user founded" , users})


})


server.listen(port,()=>{

console.log(`server is active on http://localhost:${port}`)

})
