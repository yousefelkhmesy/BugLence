package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class NavigationPage {

    private WebDriver driver;

    private By requirementAnalyzer =
            By.xpath("//button[contains(.,'Requirement Analyzer')]");

    private By bugAnalyzer =
            By.xpath("//button[contains(.,'Bug Analyzer')]");

    private By testCases =
            By.xpath("//button[contains(.,'Test Cases')]");

    private By testData =
            By.xpath("//button[contains(.,'Test Data')]");

    private By about =
            By.xpath("//button[contains(.,'About')]");

    public NavigationPage(WebDriver driver) {
        this.driver = driver;
    }

    public void openRequirementAnalyzer() {
        driver.findElement(requirementAnalyzer).click();
    }

    public void openBugAnalyzer() {
        driver.findElement(bugAnalyzer).click();
    }

    public void openTestCases() {
        driver.findElement(testCases).click();
    }

    public void openTestData() {
        driver.findElement(testData).click();
    }

    public void openAbout() {
        driver.findElement(about).click();
    }
}