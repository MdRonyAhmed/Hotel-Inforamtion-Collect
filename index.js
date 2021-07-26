const puppeteer = require('puppeteer');
const json2csv = require("json2csv").Parser;
const fs = require("fs");

async function click(button) {
    await button.evaluate(button => button.click());
   
}

(async () => {

    const target_url = 'https://www.booking.com';

    
    const browser = await puppeteer.launch({
        headless : false,
        defaultViewport: null,
    });

    const page = await browser.newPage();

    page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36");
    try{
        await page.setDefaultNavigationTimeout(0);
        await page.goto(target_url);
    }catch (e) {
        console.log(e);
    }

    await page.waitForSelector("#booking-footer > div.footer-logos.footerconstraint-inner");

    await page.waitForSelector('#ss', {timeout : 100});
    console.log('Got the Address box');

    await page.type('#ss',"Dhaka",{delay : 220});
    console.log('Address Input Complete');

    cal = await page.waitForXPath('//*[@id="frm"]/div[1]/div[2]/div[1]/div[2]/div/div/div/div/span');
        
    await click(cal);

    date1 = await page.waitForXPath('//td[@data-date = "2021-07-30"]');
    await click(date1);
    date2 = await page.waitForXPath('//td[@data-date = "2021-08-02"]');

    await page.click('#xp__guests__toggle');

    await console.log("Clicked!!!!!!");
    
    await page.$eval('#group_adults',el => {
          el.value = 2
    })

    await page.click('#frm > div.xp__fieldset.js--sb-fieldset.accommodation > div.xp__button > div.sb-searchbox-submit-col.-submit-button > button');

    await page.waitForSelector('#booking-footer > div.footer-logos.footerconstraint-inner > div > div');


    const result = await page.$$eval("#hotellist_inner > div", rows => {

        return rows.map(row => {
            const details = {};
            const name = row.querySelector('#hotellist_inner > div > div.sr_item_content.sr_item_content_slider_wrapper > div.sr_property_block_main_row > div.sr_item_main_block > div.sr-hotel__title-wrap > h3 > a > span.sr-hotel__name');
            if(name != null){
            details.Name = name.innerText;
            }

            const price = row.querySelector('#hotellist_inner > div> div.sr_item_content.sr_item_content_slider_wrapper > div.sr_rooms_table_block.clearfix.sr_card_rooms_container > div > div > div > div > div.roomPrice.roomPrice_flex.sr_discount > div.prco-wrapper.bui-price-display.prco-sr-default-assembly-wrapper.prc-d-sr-wrapper > div> div > div.bui-price-display__value.prco-inline-block-maker-helper')
            if(price != null){
                details.Price = price.innerText;
            }

            // const awards = row.querySelector('td.film-awards');
            // details.Awards = awards.innerText;

            return details;

        })
    });

    await console.log(result);
    
    const j2cp = new json2csv();
    const csv = await j2cp.parse(result);
    await fs.writeFileSync("./Hotel Info.csv", csv, "utf-8")
    await browser.close();

})();