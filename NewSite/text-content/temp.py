import json
import newspaper
from newspaper import Article
import time
import nltk
#nltk.download()
time.sleep(10)
#test.nlp()
print "started"
cnn_paper = newspaper.build('https://news.ycombinator.com/')
n = 0
while( -1 < n):
    try:
        for article in cnn_paper.articles:
            print(article.url)
        time.sleep(10)
        print "Grabbing first article"
        first_article = cnn_paper.articles[n]
        time.sleep(10)
        print "started downloading"
        first_article.download()
        time.sleep(10)
        print "started parsing"
        first_article.parse()
        time.sleep(10)
        print "started nlp"
        first_article.nlp()
        time.sleep(10)
        print "going to open"
        time.sleep(10)
        title = first_article.title
        summary = first_article.summary
        author = first_article.authors
        urll = first_article.url
        with open('blogs.json', 'r+') as f:
            data = json.load(f)
            f.seek(0)
            data["blogs"].append({'header': title , 'author': urll , 'team': 'Webmaster' , 'date': [urll], 'paragraphs' : [ summary ] })
            json.dump(data, f)
        with open('cite.json', 'r+') as f:
            data = json.load(f)
            f.seek(0)
            data["blogs"].append({'header': urll , 'author': urll , 'team': 'Webmaster' , 'date': [urll], 'paragraphs' : [ author ] })
            json.dump(data, f)
        n += 1
        print "finished"
        time.sleep(10)
    except:
        pass
        print "ERROR!!"
        time.sleep(10)
