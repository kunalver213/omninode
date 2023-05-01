const express = require('express');
const app = express();
const PORT  = 8080;

app.use( express.json() )

const repo = require('./respository');

const conn = require('./database');

const fs = require('fs')

const cors = require('cors');

app.listen(
    PORT,
    () => console.log('alive')
)

app.use(cors({ origin: 'http://localhost:4200' }));

app.get('/tshirt',(req, res) => {
    res.status(200).send({
        tshirt: 'a',
        size: 'large'
    })
});


app.post('/tshirt/:id',(req, res) => {

    const { id } = req.params;
    const { logo } = req.body;

    res.send({
        idv: id,
        logov: logo
    })
});

app.post('/loginv',(req, res) => {

    var name =  repo.login();

    console.log(name);

    const { user } = req.body;
    const { pass } = req.body;

    var status = false;

    if(user=='admin' && pass=='admin'){
        status = true;
    }else{
        status = false;
    }

    res.send({
        user : status
    })

});

app.post('/signupv',(req, res) => {

    const { user } = req.body;
    const { pass } = req.body;

    var status = false;

    if(user=='admin' && pass=='admin'){
        status = true;
    }else{
        status = false;
    }

    res.send({
        user : status
    })

});


// app.post('/login',(req, res) => {
//   conn.query("select * from users where emailAddress='' and password=''", function (err, data, fields) {
//     if(err) return next(new AppError(err))
//     res.status(200).json({
//       status: "success",
//       length: data?.length,
//       data: data,
//     });
//   });
// });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.post('/login',(req, res) => {
  conn.query(
    "select * from users where username=? and password=? ",
    [req.body.username, req.body.password],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/signup',(req, res) => {
  const values = [req.body.firstName, req.body.lastName, req.body.merchantId, req.body.emailAddress, req.body.username,
                  req.body.password, req.body.role, new Date(), new Date(), req.body.scale];
  conn.query(
    "insert into users (firstName, lastName, merchantId, emailAddress, username, password, role, createdAt, updatedAt, scale) VALUES(?)",
    [values],
    function (err, data, fields) {
      if (err){ console.log('err',err); return next(new AppError(err, 500)) };
      res.status(201).json({
        status: "success",
        message: "todo created!",
      });
    }
  );
});

app.post('/signup_merch_check',(req, res) => {
  conn.query(
    "select * from retailerid where RetailerId=?",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});


app.post('/home_trans_stats',(req, res) => {
  conn.query(
    "select sum(FinalAmount) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'sales' as grp from transactionhistory where "
				+ "LocalTransactionDate >= (now()-interval 5 day) "
				+ "and CardAcceptorIdentification = ?  "
				+ "group by LocalTransactionDate "
				+ "UNION ALL "
				+ "select sum(TransactionAmount) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'tran' as grp from transactionhistory where "
				+ "LocalTransactionDate >= (now()-interval 5 day)  "
				+ "and CardAcceptorIdentification = ?  "
				+ "group by LocalTransactionDate "
				+ "UNION ALL "
				+ "select sum(TotalCommissions) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'comm' as grp from transactionhistory where "
				+ "LocalTransactionDate >= (now()-interval 5 day)  "
				+ "and CardAcceptorIdentification = ?  "
				+ "group by LocalTransactionDate "
				+ "UNION ALL "
				+ "select sum(TotalTaxes) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'fees' as grp from transactionhistory where "
				+ "LocalTransactionDate >= (now()-interval 5 day)  "
				+ "and CardAcceptorIdentification = ?  "
				+ "group by LocalTransactionDate "
        ,
    [req.body.merchantId,req.body.merchantId,req.body.merchantId,req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/home_trans_latest',(req, res) => {
  conn.query(
    " select date_format(LocalTransactionDate, '%b %d, %Y') as datev, LocalTransactionTime as timev, ForwardingInstitutionCountryCode as CardType,   "
				+ " ProcessingCode as TransactionType, MessageType as MessageType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount,  "
        + " SettlementDate as SettelmentDate, CardAcceptorIdentification as RetailerId, SystemsTraceAuditNumber as TraceNo, "
        + " RetrievalReferenceNumber as RRN, "
        + " TransactionAmount as TransactionAmount, TotalCommissions as Commissions, TotalTaxes as fees, SUBSTRING(Track2Data, 4) as card, AuthorizationIdentificationResponse as approvalCode "
				+ " from transactionhistory   "
				+ " where LocalTransactionDate >= (now()-interval 5 day)   "
				+ " and CardAcceptorIdentification = ?  "
				+ " order by LocalTransactionDate desc limit 10;",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});


app.post('/home_resp_code',(req, res) => {
  conn.query(
          " select count(*) as count, th.ResponseCode, ResponseCodeDesc.ResponseDesc "
          + "from transactionhistory as th "
          + "LEFT JOIN ResponseCodeDesc ON th.ResponseCode = ResponseCodeDesc.ResponseCode "
          + "where th.LocalTransactionDate >= (now()-interval 5 day)  "
          + "and th.CardAcceptorIdentification = ? "
          + "group by th.ResponseCode ",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/home_resp_type',(req, res) => {
  conn.query(
        " select (sum(if(ResponseCode=00,1,0))/count(*))* 100 as successfulTransactions,  "
				+ " (sum(if(ResponseCode!=00,1,0))/count(*))* 100 as declainedTransactions "
				+ " from OMNI_MERCHANT_PORTAL.transactionhistory  "
				+ " where LocalTransactionDate >=now()-interval 5 day and LocalTransactionDate <=now()  "
				+ " and CardAcceptorIdentification = ? ",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/home_card_brand_type',(req, res) => {
  conn.query(
    " select (sum(if(ForwardingInstitutionCountryCode=8051,1,0))/count(*))* 100 as VisaTransactions,  "
    + " (sum(if(ForwardingInstitutionCountryCode=2001,1,0))/count(*))* 100 as MasterCardTransactions, "
    + " (sum(if(ForwardingInstitutionCountryCode=2002,1,0))/count(*))* 100 as MaestroTransactions "
    + " from OMNI_MERCHANT_PORTAL.transactionhistory  "
    + " where LocalTransactionDate >=now()-interval 5 day and LocalTransactionDate <=now()  "
    + " and CardAcceptorIdentification = ? ",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/home_tran_type',(req, res) => {
  conn.query(
        " select (sum(if(ProcessingCode=000000,1,0))/count(*))* 100 as PurchaseTransactions,  "
				+ " (sum(if(ProcessingCode=20000,1,0))/count(*))* 100 as RefundTransactions, "
				+ " count(*) as TotalTransactions "
				+ " from OMNI_MERCHANT_PORTAL.transactionhistory  "
				+ " where LocalTransactionDate >=now()-interval 5 day  "
				+ " and CardAcceptorIdentification = ? ",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/tran_history',(req, res) => {
  conn.query(
          " select sum(FinalAmount) as Sales, sum(TotalTaxes) as Fees, count(TransactionAmount) as Transactions, sum(TotalCommissions) as Commission "
          + "from transactionhistory where "
          + "LocalTransactionDate >=now()-interval 5 day "
          + "and CardAcceptorIdentification = ? ;",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/tran_history_table',(req, res) => {
  conn.query(
          "  select date_format(LocalTransactionDate, '%b %d, %Y') as datev, LocalTransactionTime as timev, ForwardingInstitutionCountryCode as CardType,  "
          + " ProcessingCode as TransactionType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount, "
          + " if(ResponseCode=00,1,0) as TransactionStatus "
          + " from transactionhistory where LocalTransactionDate>= now() - interval 5 day  "
          + " and CardAcceptorIdentification = ? "
          + " order by LocalTransactionDate desc ",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

// app.post('/download_report',(req, res) => {
//   conn.query(
//     "select LocalTransactionDate as Dates, ForwardingInstitutionCountryCode as CardType,  "
//     + "ProcessingCode as TransactionType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount, "
//     + "if(ResponseCode=00,'Success','InternalDecline') as TransactionStatus "
//     + "from transactionhistory where LocalTransactionDate= ?  "
//     + "and CardAcceptorIdentification = ? ",
//     [req.body.datev, req.body.merchantId],
//     function (err, data, fields) {
//       if (err) return next(new AppError(err, 500));
//       res.status(200).json({
//         length: data?.length,
//         data: data,
//       }); 
//     }
//   );
// });

app.post('/update_user',(req, res) => {
  conn.query(
          " update users SET  "
				+ " firstName = ?, lastName = ?, merchantId=?, emailAddress=?,  "
				+ " username=?, password=?, role=?, scale=?  "
				+ " where id = ? ",
    [req.body.firstName, req.body.lastName, req.body.merchantId, req.body.emailAddress, 
      req.body.username, req.body.password, req.body.role, req.body.scale, 
      req.body.id],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/getUser',(req, res) => {
  conn.query(
          " select * from users where id = ? ",
    [req.body.id],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/get_terminal_detail',(req, res) => {
  conn.query(
        " select SerialNo as No_Of_Series, Status, SequenceNumber as Model, PostingDate as created_at, updated_at as updated_at "
      + " from terminal where RetailerID = ? ",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/get_merchant_detail',(req, res) => {
  conn.query(
      " select RetailerId as retailerID, EntityId as institutionID, AcquirerRegionCode as retailerReligion, "
    + " CompanyName as retailerLegalName, Name as retailerName, StatusCode as status, "
    + " AccountNumber as accountId, BankCode as settlementBankCode, EmailAddress as emailId, "
    + " Phone as contactNumber, Address as address, CountryCode as countryCode, "
    + " StateCode as stateCode, CityCode as cityCode, "
    + " IdentificationTypeCode as identificationDocType , IdentificationNumber as taxId, MovmentType as accountType, MCC as retailerCategoryCode,"
    + " PostalCode as postalCode from retailerid where  RetailerId = ? ",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});


app.post('/get_admin-tran-detail',(req, res) => {
  conn.query(
    "select LocalTransactionDate as Dates, ForwardingInstitutionCountryCode as CardType,  "
    + "ProcessingCode as TransactionType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount, "
    + "CardAcceptorIdentification as RetailerId, SystemsTraceAuditNumber as TraceNo,  "
    + "RetrievalReferenceNumber as RRN "
    + "from transactionhistory  "
    + "where  "
    + "LocalTransactionDate>= '2020-02-01' and LocalTransactionDate<= '2023-02-01' and  "
    + "CardAcceptorIdentification in ('129812671894') "
    + "order by LocalTransactionDate desc ",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/get_admin_all_merchant_stats',(req, res) => {
  conn.query(
        "select sum(FinalAmount) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'sales' as grp "
				+ "from transactionhistory where "
				+ "LocalTransactionDate >=now()-interval 135 day  "
				+ "group by LocalTransactionDate "
				+ "union all  "
				+ "select sum(TransactionAmount) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'tran' as grp "
				+ "from transactionhistory where "
				+ "LocalTransactionDate >=now()-interval 135 day  "
				+ "group by LocalTransactionDate "
				+ "union all "
				+ "select sum(TotalCommissions) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'comm' as grp  "
				+ "from transactionhistory where "
				+ "LocalTransactionDate >=now()-interval 135 day  "
				+ "group by LocalTransactionDate "
				+ "union all "
				+ "select sum(TotalTaxes) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'fees' as grp  "
				+ "from transactionhistory where "
				+ "LocalTransactionDate >=now()-interval 135 day  "
				+ " group by LocalTransactionDate ",
    [],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      res.status(200).json({
        length: data?.length,
        data: data,
      }); 
    }
  );
});

app.post('/get_entityid',(req, res) => {
  conn.query(
    "select EntityId from retailerid where retailerid=?",
    [req.body.merchantId],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      // res.status(200).json({
      //   length: data?.length,
      //   data: data,
      // }); 
      let fiid = data[0].EntityId;
      let datev = req.body.datev;

      let filenames = [];
      const directory = fs.opendirSync('reports');
      let file;
      while ((file = directory.readSync()) !== null) {    
        if(file.name.includes(fiid+'_') && file.name.includes('_'+datev)){
          filenames.push(file.name);
        }
      }
      directory.closeSync();

      res.status(200).json({
          data: filenames,
      }); 
    }
  );
});

app.post('/get_files_list',(req, res) => {
  let fiid = req.body.fiid;
  let datev = req.body.datev;

  let filenames = [];
  const directory = fs.opendirSync('reports');
  let file;
  while ((file = directory.readSync()) !== null) {    
    if(file.name.includes(fiid+'_') && file.name.includes('_'+datev)){
      filenames.push(file.name);
    }
  }
  directory.closeSync();

  res.status(200).json({
      data: filenames,
    }); 
});

app.get('/download_report/:filename', function(req, res){
  const { filename } = req.params;
  const file = 'reports/'+filename;
  res.download(file); // Set disposition and send it.
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// app.post('/login',(req, res) => {
//     conn.query("SELECT * FROM users", function (err, data, fields) {
//       if(err) return next(new AppError(err))
//       res.status(200).json({
//         status: "success",
//         length: data?.length,
//         data: data,
//       });
//     });
// });

// exports.createTodo = (req, res, next) => {
//     if (!req.body) return next(new AppError("No form data found", 404));
//     const values = [req.body.name, "pending"];
//     conn.query(
//       "INSERT INTO todolist (name, status) VALUES(?)",
//       [values],
//       function (err, data, fields) {
//         if (err) return next(new AppError(err, 500));
//         res.status(201).json({
//           status: "success",
//           message: "todo created!",
//         });
//       }
//     );
//    };

  //  exports.getTodo = (req, res, next) => {
  //   if (!req.params.id) {
  //     return next(new AppError("No todo id found", 404));
  //   }
  //   conn.query(
  //     "SELECT * FROM todolist WHERE id = ?",
  //     [req.params.id],
  //     function (err, data, fields) {
  //       if (err) return next(new AppError(err, 500));
  //       res.status(200).json({
  //         status: "success",
  //         length: data?.length,
  //         data: data,
  //       });
  //     }
  //   );
  //  };

  //  exports.updateTodo = (req, res, next) => {
  //   if (!req.params.id) {
  //     return next(new AppError("No todo id found", 404));
  //   }
  //   conn.query(
  //     "UPDATE todolist SET status='completed' WHERE id=?",
  //     [req.params.id],
  //     function (err, data, fields) {
  //       if (err) return next(new AppError(err, 500));
  //       res.status(201).json({
  //         status: "success",
  //         message: "todo updated!",
  //       });
  //     }
  //   );
  //  };

  //  exports.deleteTodo = (req, res, next) => {
  //   if (!req.params.id) {
  //     return next(new AppError("No todo id found", 404));
  //   }
  //   conn.query(
  //     "DELETE FROM todolist WHERE id=?",
  //     [req.params.id],
  //     function (err, fields) {
  //       if (err) return next(new AppError(err, 500));
  //       res.status(201).json({
  //         status: "success",
  //         message: "todo deleted!",
  //       });
  //     }
  //   );
  //  }