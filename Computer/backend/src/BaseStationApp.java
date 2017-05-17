import java.io.IOException;

import net.tinyos.message.Message;
import net.tinyos.message.MessageListener;
import net.tinyos.message.MoteIF;

public class BaseStationApp implements MessageListener{

	private static BaseStationApp baseStation;
	private static MoteIF moteConnection;
	
	private static BaseStationApp getInstance() {
		if (baseStation == null) {
			baseStation = new BaseStationApp();
		}
		return baseStation;
	}
	
	private static MoteIF getMoteInstance() {
		if (moteConnection == null) {
			moteConnection = new MoteIF();
		}
		return moteConnection;	
	}
	
	private BaseStationApp() {
		MoteIF mote = getMoteInstance();
		mote.registerListener(new ReplyData(), this);
		mote.registerListener(new ReplyTopo(), this);
	}
	
	@Override
	public void messageReceived(int destAddr, Message msg) {
		
		if (msg instanceof ReplyTopo) {
			ReplyTopo rcv = (ReplyTopo)msg;
			
			System.out.println("Message received:\n" 
					+ "source: " + rcv.get_origem() + "\n"
					+ "type: "   + rcv.amType()     + "\n"
					+ "parent: " + rcv.get_parent() + "\n"
					+ "seq: "    + rcv.get_seqno());
		
		}
		
		if (msg instanceof ReplyData) {
			ReplyData rcv = (ReplyData)msg;
			
			System.out.println("Message received:\n" 
					+ "source: "     + rcv.get_origem() + "\n"
					+ "type: "       + rcv.amType()     + "\n"
					+ "luminosity: " + rcv.get_data_luminosity() + "\n"
					+ "temperature"  + rcv.get_data_temperature() + "\n"
					+ "seq: "    + rcv.get_seqno());
		}
		
	}

	public void sendMessageToMote(Message msg){
		if (msg != null){
			try {
				MoteIF mote = getMoteInstance();
				mote.send(MoteIF.TOS_BCAST_ADDR, msg);
			} catch (IOException e) {
				e.printStackTrace();
			}
		} else {
			System.out.println("MoteMsg is null");
		}
	}
	
	public static void main(String[] args) {
		BaseStationApp base = new BaseStationApp();
	}
	
}
