import org.json.*;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class MessageCode {

	public static String encodeReplyTopoToJson(ReplyTopo msg){
		JSONObject json = new JSONObject();
		json.put("seq", msg.get_seqno());
		json.put("id", msg.get_origem());
		json.put("parent", msg.get_parent());
		return json.toString();
	}
	
	public static String encodeReplyDataToJson(ReplyData msg){
		JSONObject json = new JSONObject();
		json.put("seq", msg.get_seqno());
		json.put("id",  msg.get_origem());
		json.put("temperature", convertTemperature(msg.get_data_temperature()));
		json.put("luminosity", msg.get_data_luminosity());		
		return json.toString();
	}
	
	public static RequestTopo decodeJsonToRequestTopo(String msgJson){
		JSONParser parser = new JSONParser();
		RequestTopo msg = new RequestTopo();
		try {
			JSONObject json = (JSONObject) parser.parse(msgJson);
			msg.set_seqno((Integer.parseInt(json.get("seq").toString())));
		} catch (ParseException e) {
			System.out.println("JSON invalido");
			e.printStackTrace();
		}
		return msg;		
	}
	
	public static RequestData decodeJsonToRequestData(String msgJson){
		JSONParser parser = new JSONParser();
		RequestData msg = new RequestData();
		try {
			JSONObject json = (JSONObject) parser.parse(msgJson);
			msg.set_seqno(Integer.parseInt(json.get("seq").toString()));
		} catch (ParseException e) {
			System.out.println("JSON invalido");
			e.printStackTrace();
		}
		return msg;		
	}
	
	public static double convertTemperature(int tempRead){
		//System.out.println("Converting " + tempRead + " to celsius");
		double tempCelsius = 0;
		try {
			double rthr = 10000 * (1023-tempRead)/tempRead;
			double logRthr = Math.log(rthr);
			double tempKelvin = 1 / (0.001010024+ (0.000242127 * logRthr) + (0.000000146 * Math.pow(logRthr, 3)));
			tempCelsius = tempKelvin - 273.15;
		} catch (ArithmeticException e) {
			System.out.println("Falha ao converter temperatura.");
		}
		return tempCelsius;
	}
	
}
