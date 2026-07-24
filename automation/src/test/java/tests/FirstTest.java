package tests;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Test;

public class FirstTest {

    WebDriver driver;

    @Test
    public void openBugLens() {

        driver = new ChromeDriver();
        driver.manage().window().maximize();

        driver.get("https://buglence.vercel.app/");

        String title = driver.getTitle();

        System.out.println("Page Title: " + title);

        Assert.assertTrue(
                title.contains("BugLens"),
                "BugLens page did not open correctly"
        );
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}