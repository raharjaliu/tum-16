import org.junit.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

/**
 * Created by aakhmerov on 11.11.16.
 */
public class TestTest {

  @Test
  public void testMethod() {
    assertThat(true, is(true));
  }
}
