var fs = require('fs');
var https = require('https');

// var forceredownload = false;
var forceredownload = true;

// downloadFile('https://github.com/ken90242/NTU_AACSB_student_DB/releases/download/v2.0.0/gmbaSetup-2.0.0.exe', '/Users/ken/200gmba.exe', ccc)
function downloadFile(url, file_path, download_callback, callback, redirect_count) {
  console.log('Attempting to download ' + url + ' to ' + file_path);
  if (redirect_count) {
    if (redirect_count > 5) {
      callback('Max redirects reached', url);
      return;
    }
  } else {
    redirect_count = 0;
  }
  var filename = file_path
  var outfile;
  if (callback == undefined) {
    console.log('WARNING downloadFile callback is undefined for ' + url + ' to ' + filename);
    callback = function(err, data) {
      console.log('lkasdjlaskdjl')
      console.log('downloadFile callback result undefined: ', err, data)
    };
  }

  var request = https.get(url, function(response) {
    var content_length = 0;
    var downloaded_bytes = 0;

    function outputInfo() {
      if (content_length === undefined) {
        content_length = 40000000
      }
      percent = parseInt((downloaded_bytes / content_length) * 100);
      console.log(filename + ' Progress: ' + percent + '%\t' + downloaded_bytes + '/' + content_length);
    }

    switch (response.statusCode) {
      case 200:
        // Try to get the content length.
        // If the server does not tell us try to use known_size argument.
        content_length = response.headers['content-length']

        // Check if file was already downloaded.
        // Note: we are just checking length not a checksum of any kind or created date.
        fs.stat(filename, function(err, stats) {
          if (!err) {
            console.log('Have already downloaded ' + filename);
            if (stats.size == content_length) {
              console.log('And the file size matches (' + content_length + ')');
              if (forceredownload === false) {
                console.log('Not Redownloading');
                callback(null, filename);
                request.abort();
                return;
              } else {
                console.log('Redownloading');
              }
            } else {
              console.log('But the file size does not match so re-downloading Old(' + stats.size + ') vs New(' + content_length + ')');
            }

          }

          outfile = fs.createWriteStream(filename);
          response.pipe(outfile);
          response.on('data', function(data) {
            downloaded_bytes += data.length;
            download_callback(downloaded_bytes, content_length)
          });
          outfile.on('finish', function() {
            console.log('Downloaded ' + url + ' to ' + filename);
            callback(null, filename);
          });

        });
        break;
      case 302:
        new_remote = response.headers.location;
        console.log('Redirect ' + url + ' to ' + new_remote);
        if (redirect_count <5) {
          downloadFile(new_remote, filename, download_callback, callback, redirect_count++);
        } else {
          console.error('Redirect limit encountered for '+url+'.');
          callback(302, null);
        }
        
        // Note: Some servers redirect requests to another url like deny.site.com if there are too many rapidly/failing requests.
        // You might want to detect that and delay a redirect to the same location.
        return;
        break;
      default:
        console.error('Problem downloading ' + url + ' STATUS: ' + response.statusCode);
        request.abort();
        callback(response.statusCode, null);
        return;
    }

  }).on('error', function(e) {
    console.error('Error Downloading: ' + url + ' ' + e.message);
    callback(e, null);
  });
}
module.exports = downloadFile
