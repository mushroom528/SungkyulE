var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var flash = require('connect-flash'); 
var session = require('express-session'); 
var methodOverride = require('method-override');

var app = express();

// mongoDB 기본 설정 4개 꼭 해야함
mongoose.set('useNewUrlParser', true);   
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true);    
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb+srv://ypper7340:tjsdlswkd12@cluster0-nlcl9.mongodb.net/test?retryWrites=true&w=majority'); // connect string으로 mongoDB랑 node 연결
var db = mongoose.connection;

app.set('view engine','ejs'); 
app.set('views', './views')
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // json형식의 데이터를 받는다
app.use(bodyParser.urlencoded({extended:true})); // form으로 받은 데이터가 req.body에 생성됨
app.use(methodOverride('_method'));
app.use(flash()); // flash 초기화 flash() 사용가능
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true})); // 사용자를 구분하기 위한 세션 관리

db.once('open', function(){
  console.log('DB connected');
}); // db 연결 성공시
db.on('error', function(err){
  console.log('DB ERROR : ', err);
}); // db연결 실패시

app.use('/', require('./routes/home'));
app.use('/users', require('./routes/users')); 

app.listen(3000, function(){ 
  console.log('server on!'); 
});