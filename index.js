var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var flash = require('connect-flash'); 
var session = require('express-session'); 
var methodOverride = require('method-override');
var passport = require('./config/passport'); 
var util = require('./util');
var app = express();
var bodyParser=require('body-parser');
var http = require('http').Server(app); //1
var io = require('socket.io')(http);

// mongoDB 기본 설정 4개 꼭 해야함
mongoose.set('useNewUrlParser', true);   
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true);    
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb+srv://ypper7340:tjsdlswkd12@cluster0-nlcl9.mongodb.net/test2?retryWrites=true&w=majority'); // connect string으로 mongoDB랑 node 연결
var db = mongoose.connection;
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set('view engine','ejs'); 
app.set('views', './views')
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // json형식의 데이터를 받는다
app.use(bodyParser.urlencoded({extended:true})); // form으로 받은 데이터가 req.body에 생성됨
app.use(methodOverride('_method'));
app.use(flash()); // flash 초기화 flash() 사용가능
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true})); // 사용자를 구분하기 위한 세션 관리
app.use(passport.initialize()); // passport 초가화
app.use(passport.session());  // passport와 session을 연결
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated(); // isAuthenticated() 현재 로그인인지 아닌지를 false, true로 반환
  res.locals.currentUser = req.user;  // 로그인된 유저 정보를 담음
  next();
})

db.once('open', function(){
  console.log('DB connected');
}); // db 연결 성공시
db.on('error', function(err){
  console.log('DB ERROR : ', err);
}); // db연결 실패시

app.use('/', require('./routes/home'));
app.use('/users', require('./routes/users')); 
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/comments', util.getPostQueryString, require('./routes/comments'));

var count=1;
io.on('connection', function(socket){ //3
  console.log('user connected: ', socket.id);  //3-1
  var name = "user" + count++;                 //3-1
  io.to(socket.id).emit('change name',name);   //3-1

  socket.on('disconnect', function(){ //3-2
    console.log('user disconnected: ', socket.id);
  });

  socket.on('send message', function(name,text){ //3-3
    var msg = name + ' : ' + text;
    console.log(msg);
    io.emit('receive message', msg);
  });
});
http.listen(3000, function(){ 
  console.log('server on!'); 
});