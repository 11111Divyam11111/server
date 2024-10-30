import { Server } from 'socket.io';

const io = new Server(8000 , {
    cors : true,
});

const emailToScoketIdMap = new Map();
const socketIdToEmailMap = new Map();
io.on("connection" , (socket)=>{
    console.log("Socket Connected : " , socket.id);
    socket.on('room:join' , data => {
        const {email , room } = data; // user ke email and room ko access kar liya by destructuring the data 

        // Map main store kar liya ki email -> socketID and socketId -> email ,ie. email is associated 
        // with this socketID and socketId is associated with this email
        emailToScoketIdMap.set(email , socket.id);
        socketIdToEmailMap.set(socket.id , email);

        
        // emit karenge(yani batayenge) that ye user join kiya hai 
        // existing users ko notification pahuch jayegi
        io.to(room).emit("user:join" , {email,id:socket.id});
        // and then us user ko join karwa denge
        socket.join(room);
        
        io.to(socket.id).emit('room:join' , data);


        // call bheja to next users
        socket.on("user:call" , ({to , offer})=>{
            // connected user jo naya aya hai user send kar denge offer(yani hamari stream)
            io.to(to).emit("incoming:call" , {from : socket.id , offer});
        });


        // call accept kiya user ne
        socket.on("call:accepted",({to , ans}) => {
            io.to(to).emit("call:accepted" , {from : socket.id , ans});
        })


        socket.on("peer:nego:needed",({to , offer})=> {
            io.to(to).emit("peer:nego:needed" , {from : socket.id , offer});

        })


        socket.on("peer:nego:done" , ({to , ans}) => {
            io.to(to).emit("peer:nego:final" , {from : socket.id , ans});

        })
    })
});
