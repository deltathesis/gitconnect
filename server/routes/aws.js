var aws = require('aws-sdk');

var aws_s3 = {};

aws_s3.getSignedRequest = function(req, res){
    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY, 
      secretAccessKey: process.env.AWS_SECRET_KEY,
      signatureVersion: 'v4',
      region: process.env.S3_REGION
    });
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: process.env.S3_BUCKET,
        Key: 'pictures/projects/' + req.query.file_name,
        Expires: 60,
        ContentType: req.query.file_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'https://'+process.env.S3_BUCKET+'.s3.amazonaws.com/pictures/projects/'+req.query.file_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
}

module.exports = aws_s3;
