import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Paths;
import java.util.stream.Collectors;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class Nashorn {

    public static final ScriptEngine engine =  new ScriptEngineManager().getEngineByName("nashorn");

    public static void main(String[] args) {
        try {
            String javascript = java.nio.file.Files.lines(Paths.get(args[0])).collect(Collectors.joining());
            StringWriter stdout = new StringWriter();
            engine.getContext().setWriter(new PrintWriter(stdout));
            engine.getContext().setErrorWriter(new PrintWriter(stdout));
            Object o = engine.eval(javascript);
            String result = o == null ? "" : o.toString().trim();
            if (result.length() == 0) result = stdout.getBuffer().toString().trim();
	    System.out.println(result);
        } catch (Throwable e) {
	    e.printStackTrace();
        }
    }
}