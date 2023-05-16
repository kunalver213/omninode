const express = require('express');
const router = new express.Router();

const fs = require('fs')

const conn = require('../database');

router.post('/get_admin-tran-detail',(req, res) => {
    conn.query(
      "select date_format(LocalTransactionDate, '%d %b %Y') as Datev, ForwardingInstitutionCountryCode as CardType,  "
      + "ProcessingCode as TransactionType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount, "
      + "CardAcceptorIdentification as RetailerId, SystemsTraceAuditNumber as TraceNo, MessageType as MessageType,  "
      + "RetrievalReferenceNumber as RRN "
      + "from transactionhistory1  "
      + "where  "
      + "LocalTransactionDate>= ? and LocalTransactionDate<= ?  "
      + "order by LocalTransactionDate desc ",
      [req.body.fromDate,req.body.toDate],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  router.post('/get_admin_all_merchant_stats',(req, res) => {
    conn.query(
          "select sum(FinalAmount) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'sales' as grp "
                  + "from transactionhistory1 where "
                  + "LocalTransactionDate >=now()-interval 135 day  "
                  + "group by LocalTransactionDate "
                  + "union all  "
                  + "select sum(TransactionAmount) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'tran' as grp "
                  + "from transactionhistory1 where "
                  + "LocalTransactionDate >=now()-interval 135 day  "
                  + "group by LocalTransactionDate "
                  + "union all "
                  + "select sum(TotalCommissions) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'comm' as grp  "
                  + "from transactionhistory1 where "
                  + "LocalTransactionDate >=now()-interval 135 day  "
                  + "group by LocalTransactionDate "
                  + "union all "
                  + "select sum(TotalTaxes) as amt, date_format(LocalTransactionDate, '%d %b %Y') as datev, 'fees' as grp  "
                  + "from transactionhistory1 where "
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

  
router.post('/get_admin-all-merchant',(req, res) => {
    conn.query(
      "select sum(FinalAmount), LocalTransactionDate, 'Sales' from transactionhistory1 where "
                  + "LocalTransactionDate >=now()-interval 500 day "
                  + "group by LocalTransactionDate  "
                  + "union all  "
                  + "select sum(TransactionAmount), LocalTransactionDate, 'Transaction' from transactionhistory1 where "
                  + "LocalTransactionDate >=now()-interval 500 day   "
                  + "group by LocalTransactionDate "
                  + "union all "
                  + "select sum(TotalCommissions), LocalTransactionDate, 'Commission' from transactionhistory1 where "
                  + "LocalTransactionDate >=now()-interval 500 day   "
                  + " group by LocalTransactionDate "
                  + "union all "
                  + "select sum(TotalTaxes), LocalTransactionDate, 'Taxes' from transactionhistory1 where "
                  + "LocalTransactionDate >=now()-interval 500 day  "
                  + " group by LocalTransactionDate;",
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
  
  
  router.post('/get_admin_tran_detail',(req, res) => {
    conn.query(
      "select LocalTransactionDate as Dates, ForwardingInstitutionCountryCode as CardType, "
                  + "ProcessingCode as TransactionType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount, "
                  + "CardAcceptorIdentification as RetailerId, SystemsTraceAuditNumber as TraceNo, RetrievalReferenceNumber as RRN "
                  + "from transactionhistory1 where LocalTransactionDate>= ? and LocalTransactionDate<= ?  "
                  + "order by LocalTransactionDate desc limit 10 ",
      [req.body.fromDate, req.body.toDate],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  
  router.post('/get_admin_merchant_list',(req, res) => {
    conn.query(
      " select RetailerId as retailerID, EntityId as institutionID, AcquirerRegionCode as retailerReligion, "
      + " CompanyName as retailerLegalName, Name as retailerName, StatusCode as status, "
      + " AccountNumber as accountId, BankCode as settlementBankCode, EmailAddress as emailId, "
      + " Phone as contactNumber, Address as address, CountryCode as countryCode, "
      + " StateCode as stateCode, CityCode as cityCode, "
      + " IdentificationTypeCode as identificationDocType , IdentificationNumber as taxId, MovmentType as accountType, MCC as retailerCategoryCode,"
      + " PostalCode as postalCode from retailerid ",
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
  
  
  router.post('/get_admin_merchant_detail',(req, res) => {
    conn.query(
      " select RetailerId as retailerID, EntityId as institutionID, AcquirerRegionCode as retailerReligion, "
      + " CompanyName as retailerLegalName, Name as retailerName, StatusCode as status, "
      + " AccountNumber as accountId, BankCode as settlementBankCode, EmailAddress as emailId, "
      + " Phone as contactNumber, Address as address, CountryCode as countryCode, "
      + " StateCode as stateCode, CityCode as cityCode, "
      + " IdentificationTypeCode as identificationDocType , IdentificationNumber as taxId, MovmentType as accountType, MCC as retailerCategoryCode,"
      + " PostalCode as postalCode from retailerid where  RetailerId = ? ",
      [req.body.retailerId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  
  router.post('/update_admin_merchant_detail',(req, res) => {
    conn.query(
            " update retailerid SET  "
            + "CompanyName = ?, Name = ?, "
            + "AccountNumber = ?, BankCode = ?, EmailAddress = ?, "
            + "Phone = ?, Address = ?, CountryCode = ?, "
            + "StateCode = ?, CityCode = ?, "
            + "PostalCode = ? where RetailerId=? ",
      [req.body.retailerLegalName,req.body.retailerName,req.body.accountId,req.body.settlementBankCode,
        req.body.emailId,req.body.contactNumber,req.body.address,req.body.countryCode,
        req.body.stateCode,req.body.cityCode,req.body.postalCode,req.body.retailerID],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
  });
  
  
  router.post('/get_admin_graphs_tran_by_aprov_decl',(req, res) => {
    conn.query(
          " select (sum(if(ResponseCode=00,1,0))) as successfulTransactions,  " +
          " (sum(if(ResponseCode!=00,1,0))) as declainedTransactions " +
          " from transactionhistory1;  " ,
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
  
  router.post('/get_admin_graphs_tran_type',(req, res) => {
    conn.query(
          " select (sum(if(ForwardingInstitutionCountryCode=8051,1,0))/count(*))* 100 as VisaTransactions,  " +
          " (sum(if(ForwardingInstitutionCountryCode=2001,1,0))/count(*))* 100 as MasterCardTransactions, " +
          " (sum(if(ForwardingInstitutionCountryCode=2002,1,0))/count(*))* 100 as MaestroTransactions " +
          " from transactionhistory1; ",
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
  
  router.post('/get_admin_graphs_resp_code',(req, res) => {
    conn.query(
            " select count(*) as count, th.ResponseCode, ResponseCodeDesc.ResponseDesc "
            + "from transactionhistory1 as th "
            + "LEFT JOIN ResponseCodeDesc ON th.ResponseCode = ResponseCodeDesc.ResponseCode "
            + "group by th.ResponseCode ",
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
  
  router.post('/get_admin_graphs_card_brand',(req, res) => {
    conn.query(
          " select (sum(if(ForwardingInstitutionCountryCode=8051,1,0))/count(*))* 100 as VisaTransactions,  "
          + " (sum(if(ForwardingInstitutionCountryCode=2001,1,0))/count(*))* 100 as MasterCardTransactions, "
          + " (sum(if(ForwardingInstitutionCountryCode=2002,1,0))/count(*))* 100 as MaestroTransactions "
          + " from transactionhistory1 ",
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
  
  
  // router.post('/get_admin_graphs_tran_by_mode',(req, res) => {
  //   conn.query(
  //         "  ",
  //     [],
  //     function (err, data, fields) {
  //       if (err) return next(new AppError(err, 500));
  //       res.status(200).json({
  //         length: data?.length,
  //         data: data,
  //       }); 
  //     }
  //   );
  // });
  
  router.post('/get_admin_graphs_tran_status',(req, res) => {
    conn.query(
            " select (sum(if(ResponseCode=00,1,0))/count(*))* 100 as successfulTransactions, " +
            " (sum(if(ResponseCode!=00,1,0))/count(*))* 100 as declainedTransactions " +
            " from transactionhistory1; ",
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

  router.post('/get_entityid_admin',(req, res) => {
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
          // if(file.name.includes(fiid+'_') && file.name.includes('_'+datev)){
            filenames.push(file.name);
          // }
        }
        directory.closeSync();
  
        res.status(200).json({
            data: filenames,
        }); 
      }
    );
  });
  
  router.post('/get_admin_top_ten_declined',(req, res) => {
    conn.query(
            " select date_format(LocalTransactionDate, '%b %d, %Y') as datev, LocalTransactionTime as timev, ForwardingInstitutionCountryCode as CardType,   " +
            " ProcessingCode as TransactionType, MessageType as MessageType, RetrievalReferenceNumber as RetrivalReferance, TransactionAmount as Amount  " +
            " from transactionhistory1 " +
            " where ResponseCode!=00  " +
            " order by LocalTransactionDate desc limit 10 ",
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


  module.exports = router;