const express = require('express');
const router = new express.Router();

const fs = require('fs')

const conn = require('../database');
const auth = require("../middleware/auth");

router.post('/home_trans_stats', auth,(req, res) => {
    conn.query(
      "select sum(FinalAmount) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'sales' as grp from transactionhistory1 where "
                  + "LocalTransactionDate >= (now()-interval 500 day) "
                  + "and CardAcceptorIdentification = ?  "
                  + "group by LocalTransactionDate "
                  + "UNION ALL "
                  + "select sum(TransactionAmount) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'tran' as grp from transactionhistory1 where "
                  + "LocalTransactionDate >= (now()-interval 500 day)  "
                  + "and CardAcceptorIdentification = ?  "
                  + "group by LocalTransactionDate "
                  + "UNION ALL "
                  + "select sum(TotalCommissions) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'comm' as grp from transactionhistory1 where "
                  + "LocalTransactionDate >= (now()-interval 500 day)  "
                  + "and CardAcceptorIdentification = ?  "
                  + "group by LocalTransactionDate "
                  + "UNION ALL "
                  + "select sum(TotalTaxes) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'fees' as grp from transactionhistory1 where "
                  + "LocalTransactionDate >= (now()-interval 500 day)  "
                  + "and CardAcceptorIdentification = ?  "
                  + "group by LocalTransactionDate "
          ,
      [req.jDec.merchantId,req.jDec.merchantId,req.jDec.merchantId,req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/home_trans_latest',auth,(req, res) => {
    conn.query(
      " select date_format(LocalTransactionDate, '%b %d, %Y') as datev, LocalTransactionTime as timev, ForwardingInstitutionCountryCode as CardType,   "
                  + " ProcessingCode as TransactionType, MessageType as MessageType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount,  "
          + " SettlementDate as SettelmentDate, CardAcceptorIdentification as RetailerId, SystemsTraceAuditNumber as TraceNo, "
          + " RetrievalReferenceNumber as RRN, "
          + " TransactionAmount as TransactionAmount, TotalCommissions as Commissions, TotalTaxes as fees, SUBSTRING(Track2Data, 4) as card, AuthorizationIdentificationResponse as approvalCode "
                  + " from transactionhistory1   "
                  + " where LocalTransactionDate >= (now()-interval 500 day)   "
                  + " and CardAcceptorIdentification = ?  "
                  + " order by LocalTransactionDate desc limit 10;",
      [req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  
  router.post('/home_resp_code',auth,(req, res) => {
    conn.query(
            " select count(*) as count, th.ResponseCode, ResponseCodeDesc.ResponseDesc "
            + "from transactionhistory1 as th "
            + "LEFT JOIN ResponseCodeDesc ON th.ResponseCode = ResponseCodeDesc.ResponseCode "
            + "where th.LocalTransactionDate >= (now()-interval 500 day)  "
            + "and th.CardAcceptorIdentification = ? "
            + "group by th.ResponseCode ",
      [req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/home_resp_type',auth,(req, res) => {
    conn.query(
          " select (sum(if(ResponseCode=00,1,0))/count(*))* 100 as successfulTransactions,  "
                  + " (sum(if(ResponseCode!=00,1,0))/count(*))* 100 as declainedTransactions "
                  + " from OMNI_MERCHANT_PORTAL.transactionhistory1  "
                  + " where LocalTransactionDate >=now()-interval 500 day and LocalTransactionDate <=now()  "
                  + " and CardAcceptorIdentification = ? ",
      [req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/home_card_brand_type',auth,(req, res) => {
    conn.query(
      " select (sum(if(ForwardingInstitutionCountryCode=8051,1,0))/count(*))* 100 as VisaTransactions,  "
      + " (sum(if(ForwardingInstitutionCountryCode=2001,1,0))/count(*))* 100 as MasterCardTransactions, "
      + " (sum(if(ForwardingInstitutionCountryCode=2002,1,0))/count(*))* 100 as MaestroTransactions "
      + " from OMNI_MERCHANT_PORTAL.transactionhistory1  "
      + " where LocalTransactionDate >=now()-interval 500 day and LocalTransactionDate <=now()  "
      + " and CardAcceptorIdentification = ? ",
      [req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/home_tran_type',auth,(req, res) => {
    conn.query(
          " select (sum(if(ProcessingCode=000000,1,0))/count(*))* 100 as PurchaseTransactions,  "
                  + " (sum(if(ProcessingCode=20000,1,0))/count(*))* 100 as RefundTransactions, "
                  + " count(*) as TotalTransactions "
                  + " from transactionhistory1  "
                  + " where LocalTransactionDate >=now()-interval 500 day  "
                  + " and CardAcceptorIdentification = ? ",
      [req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/tran_history',auth,(req, res) => {
    conn.query(
            " select sum(FinalAmount) as Sales, sum(TotalTaxes) as Fees, count(TransactionAmount) as Transactions, sum(TotalCommissions) as Commission "
            + "from transactionhistory1 where "
            + "LocalTransactionDate >=now()-interval 500 day "
            + "and CardAcceptorIdentification = ? ;",
      [req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/tran_history_table',auth,(req, res) => {
    conn.query(
            "  select date_format(LocalTransactionDate, '%b %d, %Y') as datev, LocalTransactionTime as timev, ForwardingInstitutionCountryCode as CardType,  "
            + " ProcessingCode as TransactionType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount, "
            + " if(ResponseCode=00,1,0) as TransactionStatus "
            + " from transactionhistory1 where LocalTransactionDate>= now() - interval 500 day  "
            + " and CardAcceptorIdentification = ? "
            + " order by LocalTransactionDate desc ",
      [req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  // router.post('/download_report',auth,(req, res) => {
  //   conn.query(
  //     "select LocalTransactionDate as Dates, ForwardingInstitutionCountryCode as CardType,  "
  //     + "ProcessingCode as TransactionType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount, "
  //     + "if(ResponseCode=00,'Success','InternalDecline') as TransactionStatus "
  //     + "from transactionhistory1 where LocalTransactionDate= ?  "
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
  
  router.post('/update_user',auth,(req, res) => {
    conn.query(
            " update users SET  "
                  + " firstName = ?, lastName = ?, merchantId=?, emailAddress=?,  "
                  + " username=?, password=?, role=?, scale=?  "
                  + " where id = ? ",
      [req.body.firstName, req.body.lastName, req.body.merchantId, req.body.emailAddress, 
        req.body.username, req.body.password, req.body.role, req.body.scale, 
        req.jDec.id],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/getUser', auth, (req, res) => {
    conn.query(
            " select * from users where id = ? ",
      [req.jDec.id],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/get_terminal_detail',auth,(req, res) => {
    conn.query(
          " select SerialNo as No_Of_Series, Status, SequenceNumber as Model, PostingDate as created_at, updated_at as updated_at "
        + " from terminal where RetailerID = ? ",
      [req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/get_merchant_detail',auth,(req, res) => {
    conn.query(
        " select RetailerId as retailerID, EntityId as institutionID, AcquirerRegionCode as retailerReligion, "
      + " CompanyName as retailerLegalName, Name as retailerName, StatusCode as status, "
      + " AccountNumber as accountId, BankCode as settlementBankCode, EmailAddress as emailId, "
      + " Phone as contactNumber, Address as address, CountryCode as countryCode, "
      + " StateCode as stateCode, CityCode as cityCode, "
      + " IdentificationTypeCode as identificationDocType , IdentificationNumber as taxId, MovmentType as accountType, MCC as retailerCategoryCode,"
      + " PostalCode as postalCode from retailerid where  RetailerId = ? ",
      [req.jDec.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });

  
router.post('/get_entityid',auth,(req, res) => { 
    let fiid = req.jDec.fiid;
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

  router.get('/download_report/:filename/:tokenv',auth , function(req, res){
    const { filename } = req.params;
    const file = 'reports/'+req.jDec.fiid+'_'+filename;
    res.download(file);
  });



  // router.post('/get_files_list',auth,(req, res) => {
  //   let fiid = req.body.fiid;
  //   let datev = req.body.datev;
  
  //   let filenames = [];
  //   const directory = fs.opendirSync('reports');
  //   let file;
  //   while ((file = directory.readSync()) !== null) {    
  //     if(file.name.includes(fiid+'_') && file.name.includes('_'+datev)){
  //       filenames.push(file.name);
  //     }
  //   }
  //   directory.closeSync();
  
  //   res.status(200).json({
  //       data: filenames,
  //     }); 
  // });
  
 

  module.exports = router;