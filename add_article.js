const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'locales', 'en.json');
const enData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

enData.spinPage.article = {
    "sec1Title": "Why Custom Spin the Wheel Tools Are So Popular",
    "sec1Text": "Let's be honest, making decisions all day can be exhausting. Whether you're trying to figure out what to have for dinner, picking a winner for a giveaway on your social media, or just deciding who pays for coffee, sometimes it's just easier to let fate decide. A custom spin the wheel tool is the perfect shortcut for those moments. Instead of endlessly scrolling or debating with your friends, you just drop your options into a wheel and press spin. Best of all, you're not stuck with a pre-set list. You can add literally anything to the slices—names, places, numbers, or even dare challenges for a party game. It works well because the rotating wheel and satisfying click give everyone involved a tiny burst of excitement. It takes a boring chore like \"picking someone to do the dishes\" and turns it into a quick, fun game.",

    "sec2Title": "Why We Love Leaving Things to Chance",
    "sec2Text": "There's a reason we flip coins and draw straws. The human brain actually loves leaving things up to chance because it takes the heat off of us. If you pick someone randomly out of a hat, nobody can argue that you were playing favorites. The same logic applies to a digital spinner wheel. It’s completely impartial, which instantly cuts out the \"that's not fair\" arguments. When a spinning wheel slows down and finally clicks onto the winner, it actually triggers a little hit of dopamine in our brains. That suspense—even if you're just picking a movie to watch on Netflix—is exactly why randomized wheels are so engaging. By turning a simple decision into a visual game, you're getting people to pay attention and accept the outcome with a smile.",

    "sec3Title": "A Game-Changer for Teachers and Classrooms",
    "sec3TextStart": "If you've ever stood at the front of a classroom, you know how hard it is to get everyone participating equally. The same three kids always raise their hands, while the rest try to blend into their chairs. That's why teachers love using a",
    "sec3LinkText": "Wheel of Names",
    "sec3TextMiddle": "or a custom spinner. When you put the class list on a wheel and project it onto the board, every single student knows they have an equal chance of being called on. This keeps the room alert without feeling like anyone is being unfairly targeted. You can use it for way more than just picking a student to answer a question, too. You can load a wheel with math problems, vocabulary words, or discussion topics. To make things even easier, the dedicated ",
    "sec3LinkText2": "Wheel of Names",
    "sec3TextEnd": " lets you remove a name after it's been picked, meaning every student gets a turn before anyone gets called on twice.",

    "sec4Title": "Stop Arguing Over What to Eat",
    "sec4TextStart": "We've all been there: \"What do you want to eat?\" \"I don't know, what do you want?\" It's the conversation that never ends. The more takeout options we have, the harder it gets to just make a choice. If you're tired of debating, the",
    "sec4LinkText": "Food Wheel",
    "sec4TextMiddle": "is exactly what you need. Just plug in four or five places you'd be happy with, hit spin, and commit to whatever it lands on. No more going back and forth for 45 minutes. Not only does it save time, but it also forces you to break out of your regular ordering habits. Throw in that one thai place you haven't tried yet as a wildcard, and let the wheel spice up your routine. If you need a quick decision on the go, jump over to the ",
    "sec4LinkText2": "Food Wheel",
    "sec4TextEnd": " page. It's pre-themed and looks great on your phone when hunger strikes.",

    "sec5Title": "Quick Answers for Simple Questions",
    "sec5TextStart": "A huge custom wheel is great for long lists, but sometimes you just need a straight yes or no answer. Should I buy these shoes? Should I skip the gym today? For those quick binary choices, a",
    "sec5LinkText": "Yes/No Wheel",
    "sec5TextMiddle": "is the perfect digital coin toss. Sometimes, you might actually already know what you want to do, and the wheel helps you figure it out. If the wheel lands on \"No\" and you immediately feel disappointed, well, then you obviously wanted to do it! You can also tweak the odds. If you really want to go to the gym but need a tiny push, put three \"Yes\" slices and one \"No\" slice on the wheel. For things that aren't totally black and white, adding a \"Maybe\" slice gives you a handy out. Whenever you need an instant answer without the fuss, the ",
    "sec5LinkText2": "Yes/No Wheel",
    "sec5TextEnd": " is always ready.",

    "sec6Title": "Customize It Exactly How You Want",
    "sec6TextStart": "What makes the ",
    "sec6LinkText": "Random Wheel Spinner",
    "sec6TextMiddle": " better than most apps is the fact that you can tweak everything about it. If you're running a serious company giveaway or streaming on Twitch, you need more than just a basic spinner. For example, if you want some prizes to be rarer than others, you can just duplicate the smaller prizes multiple times on the wheel so they are more likely to be hit. This \"weighting\" feature gives you total control over the odds. You can also dive into the colors and visually match the wheel to your brand or party theme. With features that let you track how many times an option has won, hide choices instantly, and tweak how the wheel looks, it's a completely professional tool disguised as a fun game. Try out the ",
    "sec6LinkText2": "main spinner tool",
    "sec6TextEnd": " and take the stress out of your next big decision."
};

fs.writeFileSync(filePath, JSON.stringify(enData, null, 4));
console.log('Successfully updated SEO article with human-sounding text in en.json');
