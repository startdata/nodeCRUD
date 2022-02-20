const express = require('express');
const app = express();
const bodyPaser = require('body-parser');

app.set('view engine', 'ejs');

let db; // 디비 접속할때 변수가 하나필요하다.

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://root:qwer1234@cluster0.qpoom.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
 function(err,client){ // database 접속이 완료되면
    if(err) {
        return console.log(err);
    }
   
    db = client.db('todoapp'); // todoapp 이라는 database(폴더)에 연결 해줘

    // db.collection('post').insertOne('저장할데이터', function(애러, 결과){
    //     console.log('저장완료');
    // post라는 파일에 insertOne{자료} 저장
    // });
    
    // db.collection('post').insertOne({이름: 'psj', 나이: 20, _id: 10}, function(애러, 결과){
    //     console.log('저장완료');
    // });
    

    //내부 코드를 실행
    app.listen(8000, function(){ //nodejs 서버띄우는 코드
        console.log('서버 시작');
    });
});


app.use(bodyPaser.urlencoded({extended : true}));

app.get('/a', function(req,res){
    res.send('apple');
});

app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', function(req,res){
    res.sendFile(__dirname + '/write.html');
});

// 어떤 사람이 /write 경로로 POST 요청을 하면....
// ??를 해주세요

app.post('/write', function(req,res){ //누가 폼에서 /write로 POST 요청하면
    res.send('전송완료');
    console.log(req.body.title);
    console.log(req.body.date);
    // db에 저장해주세요
    db.collection('counter').findOne({name: '게시물갯수'}, function(err, result){ //db.counter 내의 총게시물갯수를 찾음
        console.log(result.totalPost); 
        let 총게시물갯수 = result.totalPost; //총개시물갯수를 변수에 저장
        
        db.collection('post').insertOne({ _id : 총게시물갯수 + 1, 제목 : req.body.title, 날짜 : req.body.date }, function( err, result){ //저장이 완료됬을때 실행되는 함수
            console.log('제목 날짜 저장완료');
            // counter라는 콜랙션에 있는 totalPost 라는 항복도 1 증가 시켜야함(수정);
            // db.collection('counter').updateOne({어떤데이터를 수정할지},{수정값},function(){});
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost:1} },function(err,result){ //$set update operator 바꿔주세요
                if(err){return console.log(err)}
            })
        });
    });
});
// 총게시물갯수 +1 = auto increment



// counter라는 콜랙션에 있는 totalPost 라는 항복도 1 증가 시켜야함
app.put('/update', (req,res) =>{
    console.log('업데이트 성공');
    console.log(res.body);
});

app.delete('/deldete', (req,res)=>{
    console.log('삭제 성공');
    console.log(res.body);
});


// /list 로 get요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌

app.get('/list', function(req,res){
    //db에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(err, 결과){
        console.log(결과);
        res.render('list.ejs', { posts : 결과 }); //posts 라는이름으로 결과가 들어온다
    }); // 모든데이터 다찾기 //collection 안에 렌더를 넣어줘야한다.

    
    //1.DB에서 모든데이터 다찾아주세요
    //2.찾은걸 ejs파일에 집어넣어주세요
    
});