package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class BugAnalyzerPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By description =
            By.id("bug-description");

    private final By platform =
            By.xpath("//label[contains(.,'Platform')]/following::select[1]");

    private final By os =
            By.xpath("//label[contains(.,'Operating System') or contains(.,'OS')]/following::select[1]");

    private final By generateButton =
            By.xpath("//button[contains(.,'Generate Bug Report')]");

    private final By outputTitle =
            By.xpath("//*[contains(text(),'Your Bug Report')]");

    private final By copyButton =
            By.xpath("//button[contains(.,'Copy')]");

    private final By generateInsightsButton =
            By.xpath("//button[contains(.,'Generate AI Insights')]");

    private final By generateTestCasesButton =
            By.xpath("//button[contains(.,'Generate Test Cases')]");

    public BugAnalyzerPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(
                driver,
                Duration.ofSeconds(15)
        );
    }

    private WebElement element(By locator) {
        return wait.until(
                ExpectedConditions.presenceOfElementLocated(locator)
        );
    }

    private void scroll(WebElement element) {
        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block:'center'});",
                element
        );
    }

    private void click(By locator) {

        WebElement element = wait.until(
                ExpectedConditions.presenceOfElementLocated(locator)
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block:'center', inline:'center'});",
                element
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].click();",
                element
        );
    }

    public void enterDescription(String text) {

        WebElement input = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        description
                )
        );

        input.clear();
        input.sendKeys(text);
    }

    public String getDescription() {
        return element(description).getAttribute("value");
    }

    public boolean isGenerateEnabled() {
        return element(generateButton).isEnabled();
    }

    public void selectPlatform(String value) {

        WebElement dropdown = element(platform);

        new Select(dropdown)
                .selectByVisibleText(value);
    }

    public void selectOS(String value) {

        WebElement dropdown = element(os);

        new Select(dropdown)
                .selectByVisibleText(value);
    }

    public void generateReport() {
        click(generateButton);
    }

    public boolean waitForReport() {

        WebDriverWait aiWait =
                new WebDriverWait(
                        driver,
                        Duration.ofSeconds(120)
                );

        try {

            aiWait.until(driver ->
                    !driver.findElements(outputTitle).isEmpty()
            );

            return true;

        } catch (Exception e) {

            return false;
        }
    }

    public boolean isCopyAvailable() {

        return !driver
                .findElements(copyButton)
                .isEmpty();
    }

    public boolean isGenerateInsightsAvailable() {

        return !driver
                .findElements(generateInsightsButton)
                .isEmpty();
    }

    public boolean isGenerateTestCasesAvailable() {

        return !driver
                .findElements(generateTestCasesButton)
                .isEmpty();
    }

    public void generateInsights() {
        click(generateInsightsButton);
    }

    public void generateTestCases() {
        click(generateTestCasesButton);
    }
}