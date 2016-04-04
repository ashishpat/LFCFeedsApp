/// <reference path="../Scripts/typings/cheerio/cheerio.d.ts" />
import express = require('express');
import http = require('http');

export namespace LFCFeedsApp {
    export module Feed {
        export class Main {
            public parseString = require('xml2js').parseString;

            constructor(public feedUrl: string, public response: any) {
                this.parse(feedUrl);
            }

            private fetch(feedUrl: string, callback: Function): void {
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
            }

            public parse(url: string): any {
                var self = this;
                this.fetch(url, function (err, data) {
                    self.parseString(data, function (err, result) {
                        if (err) {
                            return console.error(err);
                        }
                        self.cleanData(result);
                    });
                });
            }

            private cleanData(data: any): void {
                var self = this;
                let newsList: Array<News> = Array();
                
                data['rss']['channel'][0]['item'].forEach(function (item: BleacherItem) {
                    
                    var description = self.stripHTML(item.description[0]);

                    var newsItem: News = {
                        Title: item.title,
                        Text: description,
                        Breaking: false,
                        Transfer: false,
                        Category: Array()
                    }

                    item.category.forEach(function (categoryItem) {
                        switch (categoryItem) {
                            case 'Breaking News':
                                newsItem.Breaking = true;
                            case 'Transfer News':
                                newsItem.Transfer = true;
                            default:
                                newsItem.Category.push(categoryItem);
                        }
                    });
                    newsList.push(newsItem);
                });
                this.response.type('xml');
                this.response.render('rss', { newsItems: newsList});
            }

            public stripHTML(data: string): string {
                var content = data.replace(/<[\/]?([^> ]+)[^>]*>/g, '');
                content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/ig, '');
                content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/ig, '');
                content = content.replace(/<!--[\s\S]*?-->/g, '');
                content = content.replace('&nbsp;', ' ');
                content = content.replace('&amp;', '&');
                return content;
            }

        }

        export interface News {
            Title: string,
            Text: string,
            Breaking?: boolean,
            Transfer?: boolean,
            Category?: Array<string>
        }

        export interface BleacherItem {
            title: string,
            guid: string,
            comments: string,
            link: string,
            pubDate: string,
            description: string,
            category: Array<string>
        }
    }
}