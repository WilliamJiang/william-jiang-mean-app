angular
    .module('app')
    .factory('UploadService',
    ['$http', '$upload', function ($http,
                                   $upload) {

        return {
            upload: function (file, idx, options) {

                $http
                    .get(options.policyURL + '?mimeType=' + file.type)
                    .success(function (response) {

                        var s3Params = response;

                        var parts = file.name.split('\.');

                        var _uuid = uuid.v4();
                        var ext = parts.pop();

                        var key = '' + _uuid + '.' + ext;

                        var uploadOptions = {
                            url: options.s3IngestURL,
                            method: 'POST',
                            fields: {
                                key: key,//'' + Math.round(Math.random() * 10000) + '-' + Math.round(Math.random() * 10000) + '-' + Math.round(Math.random() * 10000) + '-' + Math.round(Math.random() * 10000),
                                AWSAccessKeyId: s3Params.AWSAccessKeyId,
                                acl: 'public-read',
                                "Content-Type": file.type,
                                policy: s3Params.s3Policy,
                                signature: s3Params.s3Signature,
                                success_action_status: '201'
                            },
                            file: file
                        };

                        var upload = $upload.upload(uploadOptions)
                            .success(function (xml, status, headers, config) {

                                if (status === 201) {

                                    var data = xml2json.parser(xml);

                                    var parsedData = {
                                        mimeType: file.ext, // not original field
                                        location: data.postresponse.location,
                                        bucket: data.postresponse.bucket,
                                        key: data.postresponse.key,
                                        name: file.name,
                                        etag: data.postresponse.etag // not passed
                                    };

                                    file.ext = file.name.split('.').pop();

                                    $http
                                        .post(options.ingestURL, parsedData)
                                        .success(options.onSuccess)
                                        .error(options.onError);
                                }   // end status = 201
                                else {

                                    options.onError('An error occurred while uploading.');
                                }
                            })
                            .progress(options.onProgress)
                            .error(options.onError);
                    });
            }
        }
    }]);
