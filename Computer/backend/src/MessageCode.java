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
		json.put("temperature", msg.get_data_temperature());
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
	
}
