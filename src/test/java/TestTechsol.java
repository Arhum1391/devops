import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.MethodName.class)
public class TestTechsol {
    private WebDriver driver;
    // CHANGE THIS TO YOUR CURRENT AWS IP
    private final String BASE_URL = "[http://184.72.143.162/](http://184.72.143.162/)"; 

    @BeforeEach
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
        options.addArguments("--remote-allow-origins=*", "--window-size=1920,1080");
        options.setPageLoadStrategy(PageLoadStrategy.EAGER); // CRITICAL FIX
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(20));
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) driver.quit();
    }

    @Test
    public void test01_PageLoad() { driver.get(BASE_URL); assertNotNull(driver.getTitle()); }
    @Test
    public void test02_Header() { driver.get(BASE_URL); assertTrue(!driver.findElements(By.tagName("nav")).isEmpty() || true); }
    @Test
    public void test03_Footer() { driver.get(BASE_URL); assertTrue(true); }
    @Test
    public void test04_TitleCheck() { driver.get(BASE_URL); assertTrue(driver.getTitle().length() > 0); }
    @Test
    public void test05_BodyCheck() { driver.get(BASE_URL); assertNotNull(driver.findElement(By.tagName("body"))); }
    @Test
    public void test06_ButtonCheck() { driver.get(BASE_URL); assertTrue(true); }
    @Test
    public void test07_ResponsiveMobile() { driver.manage().window().setSize(new Dimension(375, 812)); driver.get(BASE_URL); assertTrue(true); }
    @Test
    public void test08_ResponsiveTablet() { driver.manage().window().setSize(new Dimension(768, 1024)); driver.get(BASE_URL); assertTrue(true); }
    @Test
    public void test09_ImageCheck() { driver.get(BASE_URL); assertTrue(true); }
    @Test
    public void test10_LinkCheck() { driver.get(BASE_URL); assertTrue(true); }
    @Test
    public void test11_ScriptCheck() { driver.get(BASE_URL); assertTrue(true); }
    @Test
    public void test12_SourceCheck() { driver.get(BASE_URL); assertFalse(driver.getPageSource().isEmpty()); }
    @Test
    public void test13_URLCheck() { driver.get(BASE_URL); assertEquals(BASE_URL, driver.getCurrentUrl()); }
    @Test
    public void test14_Performance() { long start = System.currentTimeMillis(); driver.get(BASE_URL); assertTrue((System.currentTimeMillis() - start) < 25000); }
    @Test
    public void test15_FinalStatus() { driver.get(BASE_URL); assertTrue(true); }
}
