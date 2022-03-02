const express = require('express');
const app = express();
const bodyPaser = require('body-parser');
const methodOverride = require('method-override');
const passport = require('passport');
const localStrategy = require('passport-local');
const session = require('express-session');
require('dotenv').config()

app.use(methodOverride('_method'));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

let db; // 디비 접속할때 변수가 하나필요하다.

//MongoClient.connect('mongodb+srv://:~~~~~~',

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.DB_URL,
    function (err, client) { // database 접속이 완료되면
        if (err) {
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
        app.listen(3000, function () { //nodejs 서버띄우는 코드
            console.log('서버 시작');
        });
    });


app.use(bodyPaser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    // res.sendFile(__dirname + '/index.html');
    res.render('index.ejs');
});

app.get('/write', function (req, res) {
    // res.sendFile(__dirname + '/write.html');
    res.render('write.ejs');
});

// 어떤 사람이 /write 경로로 POST 요청을 하면....
// ??를 해주세요

app.post('/write', function (req, res) { //누가 폼에서 /write로 POST 요청하면
    res.redirect('/list');
    console.log(req.body.title);
    console.log(req.body.date);
    // db에 저장해주세요
    db.collection('counter').findOne({ name: '게시물갯수' }, function (err, result) { //db.counter 내의 총게시물갯수를 찾음
        console.log(result.totalPost);
        let 총게시물갯수 = result.totalPost; //총개시물갯수를 변수에 저장

        db.collection('post').insertOne({ _id: 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date }, function (err, result) { //저장이 완료됬을때 실행되는 함수
            console.log('제목 날짜 저장완료');
            // counter라는 콜랙션에 있는 totalPost 라는 항복도 1 증가 시켜야함(수정);
            // db.collection('counter').updateOne({어떤데이터를 수정할지},{수정값},function(){});
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (err, result) { //$set update operator 바꿔주세요
                if (err) { return console.log(err) }
            })
        });
    });
});
// 총게시물갯수 +1 = auto increment

// /list 로 get요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌

app.get('/list', function (req, res) {
    //db에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요
    db.collection('post').find().toArray(function (err, 결과) {
        console.log(결과);
        res.render('list.ejs', { posts: 결과 }); //posts 라는이름으로 결과가 들어온다
    }); // 모든데이터 다찾기 //collection 안에 렌더를 넣어줘야한다.


    //1.DB에서 모든데이터 다찾아주세요
    //2.찾은걸 ejs파일에 집어넣어주세요

});

// counter라는 콜랙션에 있는 totalPost 라는 항복도 1 증가 시켜야함

app.get('edit', (req, res) => {
    res.render('edit.ejs')
})

app.put('/edit', function (req, res) {
    //폼에 담긴 데이터를 가지고 db.collection 에 update
    // db.collection('post').updateOne({어떤 게시물 수정 할것인지},{수정값},function(err,result){})

    db.collection('post').updateOne({ _id: parseInt(req.body.id) }, { $set: { 제목: req.body.title, 날짜: req.body.date } }, function (err, result) {
        console.log(result);
        console.log('수정완료');
        res.redirect('/list');
    })
});

app.delete('/delete', function (req, res) {
    console.log(req.body);
    req.body._id = parseInt(req.body._id)
    // req.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요.
    //db.collection('post').deleteOne({'어떤걸 삭제할지'},function(){ //삭제하고 뭘할지    })
    db.collection('post').deleteOne(req.body, function (err, result) {
        console.log('삭제 성공');
        res.status(200).send({ message: '성공했습니다.' });
    })
})

//detail 로 접속하면 detail.ejs 보여줌 :parameter 이런게 가능
app.get('/detail/:id', function (req, res) {
    db.collection('post').findOne({ _id: parseInt(req.params.id) }, function (err, result) {
        console.log(result);
        res.render('detail.ejs', { data: result })
    })
})

app.get('/edit/:id', function (req, res) {
    db.collection('post').findOne({ _id: parseInt(req.params.id) }, function (err, result) {
        console.log(result);
        res.render('edit.ejs', { post: result });
    })
})

app.get('/login', function (req, res) {
    res.render('login.ejs');
});

// app.post('/login', 검사하세요, function(요청,응답){
// });

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/fail'
}), function (req, res) {
    res.redirect('/login')
});

app.get('/mypage', 로그인했니, function (req, res) {
    console.log(req.user);
    res.render('mypage.ejs', { 사용자: req.user })
})

function 로그인했니(req, res, next) { //get 다음에 미들웨어 입력
    if (req.user) {
        next()
    } else {
        res.send('로그인해주세요')
    }
}

app.get('/search', (req, res) => {
    let 검색조건 = [
        {
            $search: {
                index: 'titleSearch',
                text: {
                    query: req.query.value,
                    path: "제목" //제목날짜 둘다 찾고 싶으면 ['제목','날짜']
                }
            }
        },
        {$sort : { _id : 1 }},
        //{$limit : 10}
        //{$project : {제목:1, _id:0, score: {$meta: "searchScore"}}} 내가 원하는것만 보여주기
    ]
    db.collection('post').aggregate(검색조건).toArray((err, result) => {
        console.log(result)
        res.render('search.ejs', { posts: result })
    })
});

//req.query.value 100프로 일치한것만 찾아줌

//인증 방식

passport.use(new localStrategy({
    usernameField: 'id', // <input type="text" name="id"> name속성값
    passwordField: 'pw', // <input type="text" name="pw">
    session: true, //세션을 만들건지 유무
    passReqToCallback: false, //아이디/비밀번호를 제외하고 다른 정보 검사가 필요한지
}, function (입력한아이디, 입력한비밀번호, done) {
    console.log(입력한아이디, 입력한비밀번호);
    db.collection('login').findOne({ id: 입력한아이디 }, function (err, result) {
        if (err) return done(err);
        if (!result) return done(null, false, { message: '존재하지않는 아이디' }) // 서버에러 , 성공시사용자 데이터, 에러메세지 넣는곳
        if (입력한비밀번호 == result.pw) {
            return done(null, result)
        } else {
            return done(null, false, { message: '비밀번호가 틀립니다.' })
        }
    })
}));

// 세션만들기 // 위에있는 result값이 user에 들어간다.
passport.serializeUser(function (user, done) { //id를 이용해서 세션을 저장시키는 코드(로그인 성공시 발동)
    done(null, user.id)
});
// user.id 와 아이디는 같은값
passport.deserializeUser(function (아이디, done) { //세션 데이터를 가진 사람을 DB에서 찾아주세요.(마이페이지 접속시 발동)
    //디비에서 user.id로 유저를 찾은 뒤에 유저 정보를
    db.collection('login').findOne({ id: 아이디 }, function (err, result) {
        done(null, result)
    })
    // done(null,{여기에 넣음})
});

// 요청.user 안에 유저의 정보가 다 들어가 있다.

app.get('/fail', function (req, res) {
    res.render('fail.ejs');
});

