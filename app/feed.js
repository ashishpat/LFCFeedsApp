var http = require('http');
var LFCFeedsApp;
(function (LFCFeedsApp) {
    var Feed;
    (function (Feed) {
        var Main = (function () {
            function Main(feedUrl, response) {
                this.feedUrl = feedUrl;
                this.response = response;
                this.parseString = require('xml2js').parseString;
                this.parse(feedUrl);
            }
            Main.prototype.fetch = function (feedUrl, callback) {
                var req = http.get(feedUrl, function (res) {
                    var xml = '';
                    res.on('data', function (chunk) {
                        xml += chunk;
                    });
                    res.on('error', function (e) {
                        return null;
                    });
                    res.on('timeout', function (e) {
                        return null;
                    });
                    res.on('end', function () {
                        callback(null, xml);
                    });
                });
            };
            Main.prototype.parse = function (url) {
                var self = this;
                this.fetch(url, function (err, data) {
                    self.parseString(data, function (err, result) {
                        if (err) {
                            return console.error(err);
                        }
                        self.cleanData(result);
                    });
                });
            };
            Main.prototype.cleanData = function (data) {
                var self = this;
                var newsList = Array();
                data['rss']['channel'][0]['item'].forEach(function (item) {
                    var description = self.stripHTML(item.description[0]);
                    var newsItem = {
                        Title: item.title,
                        Text: description,
                        Breaking: false,
                        Transfer: false,
                        Category: Array()
                    };
                    item.category.forEach(function (categoryItem) {
                        switch (categoryItem) {
                            case 'Breaking News':
                                newsItem.Breaking = true;
                                break;
                            case 'Transfer News':
                                newsItem.Transfer = true;
                                break;
                            default:
                                break;
                        }
                        newsItem.Category.push(categoryItem);
                    });
                    newsList.push(newsItem);
                });
                this.response.type('xml');
                this.response.render('rss', { newsItems: newsList });
            };
            Main.prototype.stripHTML = function (data) {
                var content = data.replace(/<[\/]?([^> ]+)[^>]*>/g, '');
                content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/ig, '');
                content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/ig, '');
                content = content.replace(/<!--[\s\S]*?-->/g, '');
                content = content.replace(/&(.)*;/g, '');
                return content;
            };
            return Main;
        })();
        Feed.Main = Main;
    })(Feed = LFCFeedsApp.Feed || (LFCFeedsApp.Feed = {}));
})(LFCFeedsApp = exports.LFCFeedsApp || (exports.LFCFeedsApp = {}));
//# sourceMappingURL=feed.js.map
